"use server"

import moment from "moment-timezone"
import { revalidatePath } from "next/cache"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { getAppointmentAccess } from "@/libs/appointmentBookingAccess"
import { hasAppointmentReminder, readAppointmentSlot } from "@/libs/appointmentDatabase"
import { getSlotStatus, parseAppointmentInstant } from "@/libs/appointmentSlots"
import { deleteTgNtfctnAction } from "./deleteTgNtfctnAction"
import { scheduleTgNtfctnAction } from "./scheduleTgNtfctnAction"
import { sendTelegramMessage } from "@/utils/sendTelegramMessage"

export interface BookingActionResult {
  ok: boolean
  code?: API.SlotFailureCode | "FORBIDDEN" | "NOT_FOUND"
  error?: string
  notificationError?: string
  unchanged?: boolean
}

function mapSlotError(message: string): API.SlotFailureCode | null {
  if (message.includes("APPT_SLOT_TOO_SOON")) return "SLOT_TOO_SOON"
  if (message.includes("APPT_SLOT_INVALID")) return "INVALID_SLOT"
  if (message.includes("APPT_SLOT_OCCUPIED")) return "SLOT_UNAVAILABLE"
  return null
}

export async function updateDBAppointmentAction(bookedAppointmentId: string, nextStartsAt: string): Promise<BookingActionResult> {
  const getAppointmentAccessResp = await getAppointmentAccess()
  const { data: booking, error: bookingReadError } = await supabaseAdmin
    .from("bookings")
    .select("id, user_cookie_id, booking_date, booking_time_MSK, channel")
    .eq("id", bookedAppointmentId)
    .maybeSingle()
  if (bookingReadError) return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "The appointment could not be loaded." }
  if (!booking) return { ok: false, code: "NOT_FOUND", error: "Appointment not found." }
  if (!getAppointmentAccessResp.adminId && (!getAppointmentAccessResp.userCookieId || getAppointmentAccessResp.userCookieId !== booking.user_cookie_id)) {
    return { ok: false, code: "FORBIDDEN", error: "You cannot edit this appointment." }
  }

  const nextSlot = parseAppointmentInstant(nextStartsAt)
  if (!nextSlot) return { ok: false, code: "INVALID_SLOT", error: "Choose a valid appointment start time." }
  const previousStart = moment.tz(`${booking.booking_date} ${booking.booking_time_MSK}`, "YYYY-MM-DD HH:mm:ss", true, "Europe/Moscow")
  if (!previousStart.isValid()) return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "The saved appointment time is invalid." }
  if (previousStart.valueOf() === Date.parse(nextSlot.startsAt)) return { ok: true, unchanged: true }

  const serverNow = Date.now()
  const { data: occupied, error: occupancyError } = await readAppointmentSlot(nextSlot.startsAt)
  if (occupancyError) return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "Availability is temporarily unavailable." }
  const status = getSlotStatus(nextSlot.startsAt, serverNow, occupied ? [occupied] : [])
  if (status !== "available") return { ok: false, code: status === "past" ? "SLOT_IN_PAST" : status === "too_soon" ? "SLOT_TOO_SOON" : status === "blocked" ? "SLOT_BLOCKED" : "SLOT_BOOKED", error: "That appointment time is no longer available." }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ booking_date: nextSlot.bookingDate, booking_time_MSK: `${nextSlot.timeMSK}:00` })
    .eq("id", bookedAppointmentId)
    .select("id")
    .maybeSingle()
  if (updateError || !updated) {
    const code = mapSlotError(updateError?.message ?? "")
    if (code) return { ok: false, code, error: "That appointment time is no longer available." }
    console.error("Appointment reschedule failed:", updateError?.message)
    return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "The appointment could not be saved." }
  }

  // The booking move committed atomically with its occupancy claim. Reminder work follows it;
  // any failure here is reported as a notification issue, never as a rejected slot.
  const { data: hasReminder, error: reminderReadError } = await hasAppointmentReminder(bookedAppointmentId)
  let notificationError: string | undefined
  if (reminderReadError) notificationError = "The appointment moved, but its reminder could not be checked."
  else if (hasReminder) {
    const deleteTgNtfctnActionResp = await deleteTgNtfctnAction(bookedAppointmentId)
    if (typeof deleteTgNtfctnActionResp === "string") notificationError = deleteTgNtfctnActionResp
    else {
      const reminderMessage = [
        `Date: ${moment.utc(nextSlot.bookingDate, "YYYY-MM-DD").format("DD.MM.YYYY")}`,
        `Time MSK: ${nextSlot.timeMSK}`,
        `Where: ${booking.channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : booking.channel}`,
      ].join("\n")
      const scheduleTgNtfctnActionResp = await scheduleTgNtfctnAction(reminderMessage, nextSlot.startsAt, bookedAppointmentId)
      if (typeof scheduleTgNtfctnActionResp === "string") notificationError = scheduleTgNtfctnActionResp
    }
  }

  const previousDisplay = previousStart.format("DD.MM.YYYY [at] HH:mm")
  const telegramResponse = await sendTelegramMessage(`somebody updated booking a call from ${previousDisplay} MSK to ${nextSlot.bookingDate} at ${nextSlot.timeMSK} MSK`)
  if (!telegramResponse.ok) console.error("Error sending appointment update message:", telegramResponse.description)
  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
  return { ok: true, notificationError }
}
