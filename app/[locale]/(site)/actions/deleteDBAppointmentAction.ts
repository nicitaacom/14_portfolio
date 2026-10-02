"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { getAppointmentAccess } from "@/libs/appointmentBookingAccess"
import { revalidatePath } from "next/cache"
import { sendTelegramMessage } from "@/utils/sendTelegramMessage"
import { deleteTgNtfctnAction } from "./deleteTgNtfctnAction"
import type { BookingActionResult } from "./updateDBAppointmentAction"

export async function deleteDBAppointmentAction(bookedAppointmentId: string): Promise<BookingActionResult> {
  const getAppointmentAccessResp = await getAppointmentAccess()
  const { data: booking, error: readError } = await supabaseAdmin
    .from("bookings")
    .select("id, user_cookie_id, booking_date, booking_time_MSK")
    .eq("id", bookedAppointmentId)
    .maybeSingle()
  if (readError) return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "The appointment could not be loaded." }
  if (!booking) return { ok: false, code: "NOT_FOUND", error: "Appointment not found." }
  if (!getAppointmentAccessResp.adminId && (!getAppointmentAccessResp.userCookieId || getAppointmentAccessResp.userCookieId !== booking.user_cookie_id)) {
    return { ok: false, code: "FORBIDDEN", error: "You cannot cancel this appointment." }
  }

  const { data: deleted, error: deleteError } = await supabaseAdmin
    .from("bookings")
    .delete()
    .eq("id", bookedAppointmentId)
    .select("id")
    .maybeSingle()
  if (deleteError || !deleted) return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "The appointment could not be cancelled." }

  // Deleting the booking cascades its occupancy claim. Cleanup and notification follow the commit.
  const deleteTgNtfctnActionResp = await deleteTgNtfctnAction(bookedAppointmentId)
  const telegramResponse = await sendTelegramMessage(`somebody canceled booking a call ${booking.booking_date} at ${booking.booking_time_MSK}`)
  if (!telegramResponse.ok) console.error("Error sending cancellation message:", telegramResponse.description)
  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
  return { ok: true, notificationError: typeof deleteTgNtfctnActionResp === "string" ? deleteTgNtfctnActionResp : undefined }
}
