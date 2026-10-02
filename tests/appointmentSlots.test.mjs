import assert from "node:assert/strict"
import test from "node:test"

import {
  APPOINTMENT_TIMEZONE,
  MIN_BOOKING_NOTICE_MS,
  calendarDateToDateKey,
  dateKeyToCalendarDate,
  excludeBookingOccupancy,
  formatInstantInZone,
  getEarliestAvailableSlot,
  getSlotStatus,
  getSlotsForDisplayDay,
  indexOccupancyByInstant,
  parseAppointmentInstant,
  parseMoscowSlot,
} from "../app/libs/appointmentSlots.ts"

test("strictly parse Moscow grid starts and canonical API instants", () => {
  assert.equal(parseMoscowSlot("2026-10-02", "15:00")?.startsAt, "2026-10-02T12:00:00.000Z")
  assert.equal(parseMoscowSlot("2026-02-30", "15:00"), null)
  assert.equal(parseMoscowSlot("2026-10-02", "13:15"), null)
  assert.equal(parseMoscowSlot("2026-10-02", "22:30"), null)
  assert.equal(parseAppointmentInstant("2026-10-02T12:00:00Z")?.timeMSK, "15:00")
  assert.equal(parseAppointmentInstant("2026-10-02T15:00:00+03:00")?.startsAt, "2026-10-02T12:00:00.000Z")
  for (const invalid of [
    "2026-10-02T12:00:00",
    "2026-10-02T12:00:01Z",
    "2026-10-02T12:00:00.001Z",
    "2026-10-02T10:15:00Z",
    "2026-02-30T12:00:00Z",
    "tomorrow",
  ]) assert.equal(parseAppointmentInstant(invalid), null, invalid)
})

test("notice boundary uses full milliseconds with past taking precedence", () => {
  const startsAt = "2026-10-02T12:00:00.000Z"
  const start = Date.parse(startsAt)
  assert.equal(getSlotStatus(startsAt, start - MIN_BOOKING_NOTICE_MS - 1), "available")
  assert.equal(getSlotStatus(startsAt, start - MIN_BOOKING_NOTICE_MS), "available")
  assert.equal(getSlotStatus(startsAt, start - MIN_BOOKING_NOTICE_MS + 1), "too_soon")
  assert.equal(getSlotStatus(startsAt, start), "past")
  assert.equal(getSlotStatus(startsAt, start + 2 * 60 * 60 * 1000), "past")
  assert.equal(getSlotStatus(startsAt, start - MIN_BOOKING_NOTICE_MS + 1, [{ startsAt, kind: "blocked" }]), "too_soon")
  assert.equal(getSlotStatus(startsAt, start - MIN_BOOKING_NOTICE_MS, [{ startsAt, kind: "blocked" }]), "blocked")
})

test("the earliest valid candidate respects the exact 30-minute boundary and grid", () => {
  const slots = getSlotsForDisplayDay("2026-10-02", APPOINTMENT_TIMEZONE, Date.parse("2026-10-02T09:30:00.000Z"))
  assert.equal(getEarliestAvailableSlot(slots)?.timeMSK, "13:00")
  const afterBoundary = getSlotsForDisplayDay("2026-10-02", APPOINTMENT_TIMEZONE, Date.parse("2026-10-02T09:30:00.001Z"))
  assert.equal(getEarliestAvailableSlot(afterBoundary)?.timeMSK, "13:30")
  assert.equal(getEarliestAvailableSlot(getSlotsForDisplayDay("2026-10-02", APPOINTMENT_TIMEZONE, Date.parse("2026-10-02T08:00:00Z")))?.timeMSK, "12:00")
  assert.equal(getEarliestAvailableSlot(getSlotsForDisplayDay("2026-10-02", APPOINTMENT_TIMEZONE, Date.parse("2026-10-02T18:30:00Z")))?.timeMSK, "22:00")
  assert.equal(getEarliestAvailableSlot(getSlotsForDisplayDay("2026-10-02", APPOINTMENT_TIMEZONE, Date.parse("2026-10-02T18:30:00.001Z"))), null)
})

test("date conversion uses the selected date across Berlin DST and midnight boundaries", () => {
  const winter = parseMoscowSlot("2026-01-15", "15:00")
  const summer = parseMoscowSlot("2026-07-15", "15:00")
  assert.deepEqual(formatInstantInZone(winter.startsAt, "Europe/Berlin"), { date: "2026-01-15", time: "13:00" })
  assert.deepEqual(formatInstantInZone(summer.startsAt, "Europe/Berlin"), { date: "2026-07-15", time: "14:00" })
  const tokyo = parseMoscowSlot("2026-10-02", "12:00")
  assert.deepEqual(formatInstantInZone(tokyo.startsAt, "Asia/Tokyo"), { date: "2026-10-02", time: "18:00" })
  const auckland = parseMoscowSlot("2026-10-02", "22:00")
  assert.deepEqual(formatInstantInZone(auckland.startsAt, "Pacific/Auckland"), { date: "2026-10-03", time: "08:00" })
  const kathmandu = parseMoscowSlot("2026-10-02", "15:00")
  assert.deepEqual(formatInstantInZone(kathmandu.startsAt, "Asia/Kathmandu"), { date: "2026-10-02", time: "17:45" })
})

test("display-day enumeration is sorted, bounded to local midnight, and timezone independent", () => {
  const expected = parseMoscowSlot("2026-10-02", "15:00")
  const originalTimezone = process.env.TZ
  try {
    for (const timezone of ["UTC", "Europe/Berlin", "America/Los_Angeles", "Asia/Tokyo"]) {
      process.env.TZ = timezone
      assert.deepEqual(parseMoscowSlot("2026-10-02", "15:00"), expected)
      const berlinDay = getSlotsForDisplayDay("2026-03-29", "Europe/Berlin", Date.parse("2026-03-28T00:00:00Z"))
      assert.equal(berlinDay.length, 21)
      assert.ok(berlinDay.every(slot => formatInstantInZone(slot.startsAt, "Europe/Berlin")?.date === "2026-03-29"))
      assert.deepEqual(berlinDay.map(slot => Date.parse(slot.startsAt)), [...berlinDay.map(slot => Date.parse(slot.startsAt))].sort((a, b) => a - b))
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ
    else process.env.TZ = originalTimezone
  }
  assert.deepEqual(getSlotsForDisplayDay("invalid", "Europe/Berlin", Date.now()), [])
  assert.deepEqual(getSlotsForDisplayDay("2026-10-02", "No/Such_Zone", Date.now()), [])
  assert.equal(calendarDateToDateKey(dateKeyToCalendarDate("2026-10-02")), "2026-10-02")
})

test("refreshes do not mutate occupancy input or slot input arrays", () => {
  const occupancy = [{ startsAt: "2026-10-02T12:00:00.000Z", kind: "booked" }]
  const before = structuredClone(occupancy)
  const slots = getSlotsForDisplayDay("2026-10-02", "Europe/Moscow", Date.parse("2026-10-02T00:00:00Z"), occupancy)
  const slotSnapshot = structuredClone(slots)
  assert.equal(slots.find(slot => slot.startsAt === occupancy[0].startsAt)?.status, "booked")
  assert.deepEqual(occupancy, before)
  assert.deepEqual(slots, slotSnapshot)
  assert.equal(MIN_BOOKING_NOTICE_MS, 30 * 60 * 1000)
})

test("occupancy timestamps from PostgreSQL match canonical slot starts", () => {
  const occupancy = [{ startsAt: "2026-10-02T18:00:00+00:00", kind: "blocked" }]
  const indexed = indexOccupancyByInstant(occupancy)
  assert.equal(indexed.get("2026-10-02T18:00:00.000Z"), "blocked")
  const slots = getSlotsForDisplayDay("2026-10-02", "Europe/Moscow", Date.parse("2026-10-02T10:00:00Z"), occupancy)
  assert.equal(slots.find(slot => slot.startsAt === "2026-10-02T18:00:00.000Z")?.status, "blocked")
})

test("excluding a booking for rescheduling retains blocks and other bookings", () => {
  const occupancy = [
    { startsAt: "2026-10-02T12:00:00.000Z", kind: "booked", bookingId: "current" },
    { startsAt: "2026-10-02T12:30:00.000Z", kind: "blocked", bookingId: null },
    { startsAt: "2026-10-02T13:00:00.000Z", kind: "booked", bookingId: "other" },
  ]
  assert.deepEqual(excludeBookingOccupancy(occupancy, null), occupancy)
  assert.deepEqual(excludeBookingOccupancy(occupancy, "current"), occupancy.slice(1))
})
