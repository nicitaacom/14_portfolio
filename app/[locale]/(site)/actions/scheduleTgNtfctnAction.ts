"use server"

import { createClient } from "@supabase/supabase-js"
import moment from "moment-timezone"
import { parseAppointmentInstant } from "@/libs/appointmentSlots"


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sendTgNtfcnAppointment`

function validateInputs(message: string, startsAt: string, bookingId: string): string | null {
  if (!message) return "Message is required"
  if (!parseAppointmentInstant(startsAt)) return "Choose a valid appointment time"
  if (!bookingId) return "Booking id is required"
  if (!process.env.TELEGRAM_CHAT_ID) return "Missing TELEGRAM_CHAT_ID env"
  return null
}

export async function scheduleTgNtfctnAction(
  message: string,
  startsAt: string,
  bookingId: string,
) {
  const validationError = validateInputs(message, startsAt, bookingId)
  if (validationError) return validationError

  const baseTime = moment.tz(startsAt, "Europe/Moscow")
  if (baseTime.isBefore(moment())) return "Scheduling time is in the past"

  const scheduledFor = baseTime.clone().subtract(10, "minutes")
  if (scheduledFor.isBefore(moment())) return "Reminder time is already in the past"

  const notificationId = crypto.randomUUID()
  const notificationMessage = `Reminder about meeting in 10 minutes:\n${message}`

  const { error: insertError } = await supabase.from("telegram_notifications").insert({
    id: notificationId,
    booking_id: bookingId,
    telegram_chat_id: process.env.TELEGRAM_CHAT_ID,
    message: notificationMessage,
    scheduled_for: scheduledFor.toISOString(),
  })

  if (insertError) {
    console.error("Error inserting telegram notification:", insertError)
    return `Error scheduling telegram notification: ${insertError.message}`
  }

  const cronJobName = `telegram_notification_${notificationId}`
  const cronSchedule = `${scheduledFor.minute()} ${scheduledFor.hour()} ${scheduledFor.date()} ${
    scheduledFor.month() + 1
  } *`

  const query = `
    SELECT cron.schedule(
      '${cronJobName}',
      '${cronSchedule}',
      $$SELECT net.http_post(
        url := '${EDGE_FUNCTION_URL}',
        headers := '{"Authorization": "Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}", "Content-Type": "application/json"}',
        body := '{"notificationId": "${notificationId}"}'
      )$$
    );
  `

  const { error: cronError } = await supabase.rpc("execute_any_sql", { query })
  if (cronError) {
    console.error("Error scheduling telegram cron job:", cronError)
    await supabase.from("telegram_notifications").delete().eq("id", notificationId)
    return `Error scheduling telegram cron: ${cronError.message}`
  }
}
