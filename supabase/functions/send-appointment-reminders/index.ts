import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

interface BookingRow {
  booking_date: string
  booking_time_MSK: string
  channel: string
  contact_type?: string | null
  contact_value?: string | null
  id: string
}

const PROJECT_TIMEZONE = "Europe/Moscow"
const REMINDER_MINUTES_BEFORE = 10

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value]),
  ) as Record<string, string>
}

function formatDateYmd(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

function formatHourMinute(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone)
  return `${parts.hour}:${parts.minute}`
}

function formatBookingLabel(booking: BookingRow) {
  return `${booking.booking_date} ${booking.booking_time_MSK.slice(0, 5)} ${PROJECT_TIMEZONE}`
}

function buildTelegramMessage(bookings: BookingRow[], targetHourMinute: string) {
  const lines = bookings.map((booking, index) => {
    const contactLabel =
      booking.contact_type && booking.contact_value
        ? ` | ${booking.contact_type}: ${booking.contact_value}`
        : ""

    return `${index + 1}. ${formatBookingLabel(booking)} | ${booking.channel}${contactLabel} | bookingId: ${booking.id}`
  })

  return [
    `Reminder: appointment starts in ${REMINDER_MINUTES_BEFORE} minutes`,
    `MSK target minute: ${targetHourMinute}`,
    "",
    ...lines,
  ].join("\n")
}

console.info("send-appointment-reminders edge function started")

Deno.serve(async req => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN")
  const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID")

  if (!supabaseUrl || !supabaseServiceRoleKey || !telegramBotToken || !telegramChatId) {
    return new Response(
      JSON.stringify({
        error:
          "Missing one of SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const now = new Date()
  const targetDate = new Date(now.getTime() + REMINDER_MINUTES_BEFORE * 60 * 1000)
  const targetBookingDate = formatDateYmd(targetDate, PROJECT_TIMEZONE)
  const targetHourMinute = formatHourMinute(targetDate, PROJECT_TIMEZONE)

  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_date, booking_time_MSK, channel, contact_type, contact_value")
    .eq("booking_date", targetBookingDate)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const bookings = (data ?? []).filter(booking => booking.booking_time_MSK.slice(0, 5) === targetHourMinute)

  if (bookings.length === 0) {
    return new Response(
      JSON.stringify({
        ok: true,
        sent: 0,
        targetBookingDate,
        targetHourMinute,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  }

  const telegramMessage = buildTelegramMessage(bookings, targetHourMinute)
  const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

  const telegramResponse = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text: telegramMessage,
    }),
  })

  if (!telegramResponse.ok) {
    const telegramError = await telegramResponse.text()
    return new Response(JSON.stringify({ error: telegramError }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(
    JSON.stringify({
      ok: true,
      sent: bookings.length,
      targetBookingDate,
      targetHourMinute,
    }),
    { headers: { "Content-Type": "application/json" } },
  )
})
