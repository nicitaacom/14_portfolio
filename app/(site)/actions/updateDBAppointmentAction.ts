"use server"

import moment from "moment"
import { revalidatePath } from "next/cache"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { sendTelegramMessageAction } from "./sendTelegramMessageAction"

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

  await sendTelegramMessageAction(
    `somebody updated booking a call from ${prevBookingDate} at ${prevBookingTimeMSK} to ${moment(normalizedDate).format("DD.MM.YYYY")} at ${normalizedTime}`,
  )

  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
}
