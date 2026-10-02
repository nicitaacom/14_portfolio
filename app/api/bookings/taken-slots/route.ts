import { NextResponse } from "next/server"

import { APPOINTMENT_TIMEZONE, getDisplayDayInterval, isValidDateKey } from "@/libs/appointmentSlots"
import { readAppointmentOccupancy } from "@/libs/appointmentDatabase"

/** Safe compatibility response for older bundles. Blocks count as unavailable too. */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date")
  if (!isValidDateKey(date)) return NextResponse.json({ ok: false, error: "A valid date is required." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  const interval = getDisplayDayInterval(date, APPOINTMENT_TIMEZONE)
  if (!interval) return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  const { data, error } = await readAppointmentOccupancy(interval.startsAtOrAfter, interval.before)
  if (error || !data) return NextResponse.json({ ok: false, error: "Availability is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } })
  return NextResponse.json({ ok: true, slots: data.map(slot => new Date(slot.startsAt).toLocaleTimeString("en-GB", { timeZone: APPOINTMENT_TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })) }, { headers: { "Cache-Control": "no-store" } })
}
