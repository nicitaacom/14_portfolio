import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

import { deleteTgNtfctnAction } from "../../../[locale]/(site)/actions/deleteTgNtfctnAction"
import { scheduleTgNtfctnAction } from "../../../[locale]/(site)/actions/scheduleTgNtfctnAction"
import { consumeRateLimit, getRateLimitHeaders, getRequestIp } from "@/libs/rateLimitServer"
import { readAppointmentSlot } from "@/libs/appointmentDatabase"
import { getSlotStatus, parseAppointmentInstant } from "@/libs/appointmentSlots"
import supabaseAdmin from "@/libs/supabaseAdmin"

const BOOKING_LIMIT_DESCRIPTION = "You can book up to 2 appointments per day. This limit resets at 00:00 UTC."
const CONTACT_TYPES = new Set(["telegram", "discord", "email", "linkedin"])
const CHANNELS = new Set(["telegram", "discord", "google-meets"])
const NOTIFICATION_TARGETS = new Set(["tg", "dis", "email"])

function slotFailure(code: API.SlotFailureCode, serverNow: string, status: number, error: string) {
  return NextResponse.json<API.InsertBookingResponse>(
    { ok: false, code, error, serverNow, minimumNoticeMinutes: 30 },
    { status, headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Invalid JSON request." }, { status: 400 })
  }
  if (!body || typeof body !== "object") return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Invalid booking request." }, { status: 400 })
  const input = body as Record<string, unknown>
  if (typeof input.startsAt !== "string") {
    return slotFailure("SELECTION_REFRESH_REQUIRED", new Date().toISOString(), 409, "Please reload the appointment page and choose a time again.")
  }
  const slot = parseAppointmentInstant(input.startsAt)
  if (!slot) return slotFailure("INVALID_SLOT", new Date().toISOString(), 400, "Choose a valid appointment start time.")
  if (typeof input.bookingId !== "string" || input.bookingId.length < 8 || input.bookingId.length > 100) {
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Invalid booking ID." }, { status: 400 })
  }
  if (typeof input.contact !== "string" || input.contact.trim().length < 3 || typeof input.contactType !== "string" || !CONTACT_TYPES.has(input.contactType)) {
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Contact details are required." }, { status: 400 })
  }
  if (typeof input.channel !== "string" || !CHANNELS.has(input.channel)) {
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Choose a meeting channel." }, { status: 400 })
  }
  if (typeof input.isSendNotification !== "boolean" || typeof input.sendNotificationTo !== "string" || !NOTIFICATION_TARGETS.has(input.sendNotificationTo) || typeof input.inputNotificationTo !== "string") {
    return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: "Invalid reminder details." }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("user_cookie_id")?.value
  const userCookieId = cookieValue || nanoid()
  const ip = getRequestIp(await headers())
  const burstRateLimit = await consumeRateLimit({ limiterName: "bookingSubmitBurst", userCookieId, ip })
  if (!burstRateLimit.success) {
    return NextResponse.json<API.InsertBookingResponse>(
      { ok: false, error: `Too many booking attempts in a short time. Please wait a few minutes and try again. ${BOOKING_LIMIT_DESCRIPTION}` },
      { status: 429, headers: getRateLimitHeaders(burstRateLimit) },
    )
  }

  const serverNow = new Date().toISOString()
  const { data: occupied, error: occupancyError } = await readAppointmentSlot(slot.startsAt)
  if (occupancyError) {
    console.error("Booking availability read failed:", occupancyError.message)
    return slotFailure("AVAILABILITY_UNAVAILABLE", serverNow, 503, "Availability is temporarily unavailable. Please try again.")
  }
  const status = getSlotStatus(slot.startsAt, Date.parse(serverNow), occupied ? [occupied] : [])
  if (status !== "available") {
    const errors: Record<Exclude<typeof status, "available">, { code: API.SlotFailureCode; message: string }> = {
      past: { code: "SLOT_IN_PAST", message: "That time has already passed. Please choose a time at least 30 minutes from now." },
      too_soon: { code: "SLOT_TOO_SOON", message: "Appointments need at least 30 minutes' notice. Please choose a later time." },
      blocked: { code: "SLOT_BLOCKED", message: "The host is unavailable at that time. Please choose another time." },
      booked: { code: "SLOT_BOOKED", message: "Someone else has just booked that time. Please choose another time." },
    }
    return slotFailure(errors[status].code, serverNow, 409, errors[status].message)
  }

  const { error: insertError } = await supabaseAdmin.from("bookings").insert({
    id: input.bookingId,
    booking_date: slot.bookingDate,
    booking_time_MSK: `${slot.timeMSK}:00`,
    channel: input.channel,
    user_cookie_id: userCookieId,
    contact: input.contact.trim(),
    contact_type: input.contactType,
  })
  if (insertError) {
    const message = insertError.message ?? ""
    let code: API.SlotFailureCode | null = message.includes("APPT_SLOT_TOO_SOON") ? "SLOT_TOO_SOON"
      : message.includes("APPT_SLOT_INVALID") ? "INVALID_SLOT"
        : null
    if (message.includes("APPT_SLOT_OCCUPIED")) {
      const { data: currentOccupant } = await readAppointmentSlot(slot.startsAt)
      code = currentOccupant?.kind === "blocked" ? "SLOT_BLOCKED" : currentOccupant?.kind === "booked" ? "SLOT_BOOKED" : "SLOT_UNAVAILABLE"
    }
    if (code) {
      const messages: Partial<Record<API.SlotFailureCode, string>> = {
        SLOT_TOO_SOON: "Appointments need at least 30 minutes' notice. Please choose a later time.",
        INVALID_SLOT: "Choose a valid appointment start time.",
        SLOT_BLOCKED: "The host is unavailable at that time. Please choose another time.",
        SLOT_BOOKED: "Someone else has just booked that time. Please choose another time.",
        SLOT_UNAVAILABLE: "That time is no longer available. Please refresh and choose again.",
      }
      return slotFailure(code, new Date().toISOString(), code === "INVALID_SLOT" ? 400 : 409, messages[code] ?? "That time is no longer available.")
    }
    console.error("Error inserting appointment:", message)
    return slotFailure("AVAILABILITY_UNAVAILABLE", new Date().toISOString(), 503, "The booking could not be saved. Please try again.")
  }

  if (input.isSendNotification && input.sendNotificationTo === "tg") {
    const reminderMessage = [
      `Contact: ${input.contactType}: ${input.contact.trim()}`,
      `Send notification to tg: ${input.inputNotificationTo}`,
      `Where: ${input.channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : input.channel}`,
    ].join("\n")
    const scheduleResp = await scheduleTgNtfctnAction(reminderMessage, slot.startsAt, input.bookingId)
    if (typeof scheduleResp === "string") {
      await supabaseAdmin.from("bookings").delete().eq("id", input.bookingId)
      return NextResponse.json<API.InsertBookingResponse>({ ok: false, error: scheduleResp }, { status: 503 })
    }
  }

  const bookingQuotaRateLimit = await consumeRateLimit({ limiterName: "bookACall", userCookieId, ip })
  if (!bookingQuotaRateLimit.success) {
    if (input.isSendNotification && input.sendNotificationTo === "tg") {
      const deleteNotificationResp = await deleteTgNtfctnAction(input.bookingId)
      if (typeof deleteNotificationResp === "string") console.error("Failed to rollback Telegram reminder after rate limit:", deleteNotificationResp)
    }
    const { error: rollbackError } = await supabaseAdmin.from("bookings").delete().eq("id", input.bookingId)
    if (rollbackError) console.error("Failed to rollback appointment after rate limit:", rollbackError.message)
    return NextResponse.json<API.InsertBookingResponse>(
      { ok: false, error: `Daily booking limit reached. ${BOOKING_LIMIT_DESCRIPTION}` },
      { status: 429, headers: getRateLimitHeaders(bookingQuotaRateLimit) },
    )
  }

  const response = NextResponse.json<API.InsertBookingResponse>({
    ok: true,
    booking: { id: input.bookingId, startsAt: slot.startsAt, bookingDate: slot.bookingDate, timeMSK: slot.timeMSK },
  })
  if (!cookieValue) response.cookies.set("user_cookie_id", userCookieId, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
  return response
}
