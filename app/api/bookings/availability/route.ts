import { NextResponse } from "next/server"

import {
  getDisplayDayInterval,
  getSlotsForDisplayDay,
  excludeBookingOccupancy,
  isValidDateKey,
  isValidTimezone,
} from "@/libs/appointmentSlots"
import { readAppointmentOccupancy } from "@/libs/appointmentDatabase"
import { getAppointmentAccess } from "@/libs/appointmentBookingAccess"
import supabaseAdmin from "@/libs/supabaseAdmin"

function noStore() {
  return { "Cache-Control": "no-store, max-age=0" }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const date = url.searchParams.get("date")
  const timezone = url.searchParams.get("timezone")
  if (!isValidDateKey(date) || !isValidTimezone(timezone)) {
    return NextResponse.json({ ok: false, error: "A valid date and IANA timezone are required." }, { status: 400, headers: noStore() })
  }

  const interval = getDisplayDayInterval(date, timezone)
  if (!interval) return NextResponse.json({ ok: false, error: "Invalid display day." }, { status: 400, headers: noStore() })
  const excludeBookingId = url.searchParams.get("excludeBookingId")
  let authorizedBookingId: string | null = null
  if (excludeBookingId) {
    const getAppointmentAccessResp = await getAppointmentAccess()
    const { data: booking } = await supabaseAdmin.from("bookings").select("id, user_cookie_id").eq("id", excludeBookingId).maybeSingle()
    if (!booking || (!getAppointmentAccessResp.adminId && (!getAppointmentAccessResp.userCookieId || getAppointmentAccessResp.userCookieId !== booking.user_cookie_id))) {
      return NextResponse.json({ ok: false, error: "Booking access denied." }, { status: 403, headers: noStore() })
    }
    authorizedBookingId = booking.id
  }
  const { data: occupancyRows, error } = await readAppointmentOccupancy(interval.startsAtOrAfter, interval.before)
  const occupancy = occupancyRows ? excludeBookingOccupancy(occupancyRows, authorizedBookingId) : null
  if (error || !occupancy) {
    console.error("Appointment availability read failed:", error?.message)
    return NextResponse.json({ ok: false, code: "AVAILABILITY_UNAVAILABLE", error: "Availability is temporarily unavailable." }, { status: 503, headers: noStore() })
  }

  const serverNow = new Date().toISOString()
  const slots = getSlotsForDisplayDay(date, timezone, Date.parse(serverNow), occupancy)
  return NextResponse.json({ ok: true, date, timezone, serverNow, minimumNoticeMinutes: 30, slots }, { headers: noStore() })
}
