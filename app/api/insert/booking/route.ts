import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

import { deleteTgNtfctnAction } from "@/(site)/actions/deleteTgNtfctnAction"
import { scheduleTgNtfctnAction } from "@/(site)/actions/scheduleTgNtfctnAction"
import { consumeRateLimit } from "@/libs/rateLimitServer"
import supabaseAdmin from "@/libs/supabaseAdmin"
import moment from "moment"

export async function POST(req: Request) {
  const {
    bookingId,
    selectedDate,
    atMSK,
    channel,
    contactType,
    contact,
    isSendNotification,
    sendNotificationTo,
    inputNotificationTo,
  } = (await req.json()) as API.InsertBookingRequest
  const normalizedContact = contact.trim()

  const userCookieId = cookies().get("user_cookie_id")?.value || nanoid()

  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  const date = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
  if (!date)
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "No selectedDate" }, { status: 400 })
  if (!bookingId)
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Missing bookingId" }, { status: 400 })
  if (!contactType || !contact || contact.trim().length < 3) {
    return NextResponse.json<API.InsertBookingResponse>(
      { ok: false, error: "Contact details are required." },
      { status: 400 },
    )
  }
  const bookingDate = moment(date).format("YYYY-MM-DD")

  // Check is booking with this time already exists
  const { data } = await supabaseAdmin
    .from("bookings")
    .select()
    .eq("booking_time_MSK", atMSK)
    .eq("booking_date", bookingDate)

  if (data && data.length > 0) {
    console.error(45, "Error inserting booking: booking with this date time already exists")
    return NextResponse.json<API.InsertBookingResponse>(
      { ok: false, error: "Error inserting booking: booking with this date time already exists." },
      { status: 409 },
    )
  }
  const { error } = await supabaseAdmin.from("bookings").insert({
    id: bookingId,
    booking_date: bookingDate,
    booking_time_MSK: atMSK,
    channel: channel,
    user_cookie_id: userCookieId,
    contact: `${contactType}: ${normalizedContact}`,
    contact_type: contactType,
  })

  if (error) {
    console.error(40, "Error inserting booking:", error)
    return NextResponse.json<API.InsertBookingResponse>(
      { ok: false, error: `Error inserting booking: ${error.message}` },
      { status: 400 },
    )
  }

  if (isSendNotification && sendNotificationTo === "tg") {
    const reminderMessage = [
      `Contact: ${contactType}: ${normalizedContact}`,
      `Send notifiaction to ${sendNotificationTo}: ${inputNotificationTo}`,
      `Where: ${channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : channel}`,
    ].join("\n")

    const scheduleResp = await scheduleTgNtfctnAction(reminderMessage, date, atMSK, bookingId)
    if (typeof scheduleResp === "string") {
      await supabaseAdmin.from("bookings").delete().eq("id", bookingId)
      return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: scheduleResp }, { status: 400 })
    }
  }

  // Only consume the daily booking limit after the whole booking flow succeeded.
  const { success } = await consumeRateLimit({
    limiterName: "bookACall",
    userCookieId,
    ip,
  })

  if (!success) {
    if (isSendNotification && sendNotificationTo === "tg") {
      const deleteNotificationResp = await deleteTgNtfctnAction(bookingId)
      if (typeof deleteNotificationResp === "string") {
        console.error("Failed to rollback telegram reminder after rate limit:", deleteNotificationResp)
      }
    }

    const { error: rollbackError } = await supabaseAdmin.from("bookings").delete().eq("id", bookingId)
    if (rollbackError) {
      console.error("Failed to rollback booking after rate limit:", rollbackError)
    }

    return NextResponse.json<API.InsertBookingResponse>(
      { ok: false, error: "You have already booked a call today. Please try again tomorrow." },
      { status: 429 },
    )
  }

  return NextResponse.json<API.InsertBookingResponse>({ ok: true })
}
