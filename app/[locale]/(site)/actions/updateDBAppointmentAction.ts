"use server"

import { createClient } from "@supabase/supabase-js"
import moment from "moment"
import { revalidatePath } from "next/cache"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { deleteTgNtfctnAction } from "./deleteTgNtfctnAction"
import { scheduleTgNtfctnAction } from "./scheduleTgNtfctnAction"
import { sendTelegramMessage } from "@/utils/sendTelegramMessage"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function normalizeBookingTimeMSK(timeValue: string) {
  return timeValue.length === 5 ? `${timeValue}:00` : timeValue
}

export async function updateDBAppointmentAction(
  bookedAppointmentId: string,
  nextBookingDate: string,
  nextBookingTimeMSK: string,
  prevBookingDate: string,
  prevBookingTimeMSK: string,
) {
  const normalizedDate = moment(nextBookingDate).format("YYYY-MM-DD")
  const normalizedTime = normalizeBookingTimeMSK(nextBookingTimeMSK)

  const { data: existingReminderRows, error: reminderError } = await supabase
    .from("telegram_notifications")
    .select("id")
    .eq("booking_id", bookedAppointmentId)

  if (reminderError) throw new Error(reminderError.message)

  const { data: currentBooking, error: currentBookingError } = await supabaseAdmin
    .from("bookings")
    .select("id, channel")
    .eq("id", bookedAppointmentId)
    .single()

  if (currentBookingError) throw new Error(currentBookingError.message)

  const { data: existingBooking, error: existingBookingError } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("booking_date", normalizedDate)
    .eq("booking_time_MSK", normalizedTime)
    .neq("id", bookedAppointmentId)
    .limit(1)

  if (existingBookingError) throw new Error(existingBookingError.message)
  if (existingBooking && existingBooking.length > 0) {
    throw new Error("This appointment slot is already booked.")
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      booking_date: normalizedDate,
      booking_time_MSK: normalizedTime,
    })
    .eq("id", bookedAppointmentId)

  if (error) throw new Error(error.message)

  if (existingReminderRows && existingReminderRows.length > 0) {
    const deleteNotificationResp = await deleteTgNtfctnAction(bookedAppointmentId)
    if (typeof deleteNotificationResp === "string") throw new Error(deleteNotificationResp)

    const reminderMessage = [
      `Date: ${moment(normalizedDate).format("DD.MM.YYYY")}`,
      `Time MSK: ${normalizedTime}`,
      `Where: ${currentBooking.channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : currentBooking.channel}`,
    ].join("\n")

    const scheduleResp = await scheduleTgNtfctnAction(reminderMessage, normalizedDate, normalizedTime, bookedAppointmentId)
    if (typeof scheduleResp === "string") throw new Error(scheduleResp)
  }

  const telegramResponse = await sendTelegramMessage(
    `somebody updated booking a call from ${prevBookingDate} at ${prevBookingTimeMSK} to ${moment(normalizedDate).format("DD.MM.YYYY")} at ${normalizedTime}`,
  )
  if (!telegramResponse.ok) console.error("Error sending telegram message:", telegramResponse.description)

  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
}
