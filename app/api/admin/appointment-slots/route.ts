import { NextResponse } from "next/server"

import supabaseServer from "@/libs/supabaseServer"
import { parseAdminUserIdArr } from "@/libs/adminAuth"
import { readAppointmentOccupancy, setAppointmentBlocks } from "@/libs/appointmentDatabase"
import {
  getDisplayDayInterval,
  getSlotStatus,
  getSlotsForDisplayDay,
  excludeBookingOccupancy,
  indexOccupancyByInstant,
  isValidDateKey,
  isValidTimezone,
  parseAppointmentInstant,
} from "@/libs/appointmentSlots"

function responseHeaders() {
  return { "Cache-Control": "no-store, max-age=0" }
}

async function authorizeAdmin() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.id) return { response: NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401, headers: responseHeaders() }) }
  if (!parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR).includes(data.user.id)) {
    return { response: NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403, headers: responseHeaders() }) }
  }
  return { userId: data.user.id }
}

export async function GET(request: Request) {
  const authorization = await authorizeAdmin()
  if ("response" in authorization) return authorization.response

  const url = new URL(request.url)
  const date = url.searchParams.get("date")
  const timezone = url.searchParams.get("timezone")
  if (!isValidDateKey(date) || !isValidTimezone(timezone)) {
    return NextResponse.json({ ok: false, error: "A valid date and IANA timezone are required." }, { status: 400, headers: responseHeaders() })
  }
  const interval = getDisplayDayInterval(date, timezone)
  if (!interval) return NextResponse.json({ ok: false, error: "Invalid display day." }, { status: 400, headers: responseHeaders() })
  const excludeBookingId = url.searchParams.get("excludeBookingId")
  let authorizedBookingId: string | null = null
  if (excludeBookingId) {
    const { data: booking } = await (await supabaseServer()).from("bookings").select("id").eq("id", excludeBookingId).maybeSingle()
    if (!booking) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404, headers: responseHeaders() })
    authorizedBookingId = booking.id
  }
  const { data: occupancyRows, error } = await readAppointmentOccupancy(interval.startsAtOrAfter, interval.before)
  const occupancy = occupancyRows ? excludeBookingOccupancy(occupancyRows, authorizedBookingId) : null
  if (error || !occupancy) {
    console.error("Admin appointment availability read failed:", error?.message)
    return NextResponse.json({ ok: false, error: "Availability is temporarily unavailable." }, { status: 503, headers: responseHeaders() })
  }

  const serverNow = new Date().toISOString()
  const nowMs = Date.parse(serverNow)
  const occupiedByInstant = indexOccupancyByInstant(occupancy)
  const slots = getSlotsForDisplayDay(date, timezone, nowMs, occupancy).map(slot => ({
    startsAt: slot.startsAt,
    bookingDate: slot.bookingDate,
    timeMSK: slot.timeMSK,
    occupancy: occupiedByInstant.get(slot.startsAt) ?? "free",
    eligibility: getSlotStatus(slot.startsAt, nowMs) === "available" ? "eligible" : getSlotStatus(slot.startsAt, nowMs),
  }))
  return NextResponse.json({ ok: true, date, timezone, serverNow, slots }, { headers: responseHeaders() })
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin()
  if ("response" in authorization) return authorization.response
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, error: "Cross-origin request rejected." }, { status: 403, headers: responseHeaders() })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400, headers: responseHeaders() })
  }
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: responseHeaders() })
  const input = body as { startsAt?: unknown; blocked?: unknown }
  if (!Array.isArray(input.startsAt) || input.startsAt.length < 1 || input.startsAt.length > 64 || typeof input.blocked !== "boolean") {
    return NextResponse.json({ ok: false, error: "Choose between 1 and 64 slots." }, { status: 400, headers: responseHeaders() })
  }
  const parsed = input.startsAt.map(parseAppointmentInstant)
  if (parsed.some(slot => !slot)) return NextResponse.json({ ok: false, error: "One or more slots are invalid." }, { status: 400, headers: responseHeaders() })
  const startsAt = [...new Set(parsed.map(slot => slot!.startsAt))].sort()
  if (startsAt.some(slot => Date.parse(slot) <= Date.now())) {
    return NextResponse.json({ ok: false, error: "Past slots cannot be changed." }, { status: 409, headers: responseHeaders() })
  }

  const { data, error } = await setAppointmentBlocks(startsAt, input.blocked, authorization.userId)
  if (error || !data) {
    if (error?.message.includes("APPT_SLOT_BOOKED")) {
      return NextResponse.json({ ok: false, code: "SLOT_BOOKED", error: "A selected slot is booked. Refresh and choose again." }, { status: 409, headers: responseHeaders() })
    }
    if (error?.message.includes("APPT_SLOT_INVALID") || error?.message.includes("APPT_SLOT_PAST")) {
      return NextResponse.json({ ok: false, error: "One or more slots can no longer be changed." }, { status: 409, headers: responseHeaders() })
    }
    console.error("Admin appointment block mutation failed:", error?.message)
    return NextResponse.json({ ok: false, error: "Availability is temporarily unavailable." }, { status: 503, headers: responseHeaders() })
  }
  return NextResponse.json({ ok: true, ...data }, { headers: responseHeaders() })
}
