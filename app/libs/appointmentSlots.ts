import moment from "moment-timezone"

import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"

export const APPOINTMENT_TIMEZONE = "Europe/Moscow"
export const MIN_BOOKING_NOTICE_MS = 30 * 60 * 1000
export const MIN_BOOKING_NOTICE_MINUTES = 30

export type AppointmentSlotStatus = "available" | "booked" | "blocked" | "past" | "too_soon"

export interface AppointmentSlot {
  startsAt: string
  bookingDate: string
  timeMSK: string
  status: AppointmentSlotStatus
}

export interface OccupiedSlot {
  startsAt: string
  kind: "booked" | "blocked"
  bookingId?: string | null
}

export function excludeBookingOccupancy(occupancy: OccupiedSlot[], excludedBookingId: string | null): OccupiedSlot[] {
  return excludedBookingId ? occupancy.filter(slot => slot.bookingId !== excludedBookingId) : occupancy
}

export interface InstantInterval {
  startsAtOrAfter: string
  before: string
}

export function indexOccupancyByInstant(occupancy: OccupiedSlot[]): Map<string, OccupiedSlot["kind"]> {
  return new Map(occupancy.map(item => [new Date(item.startsAt).toISOString(), item.kind]))
}

const SCHEDULE_TIMES = appointmentTimesMSK.map(({ time }) => time)
const DATE_FORMAT = "YYYY-MM-DD"
const TIME_FORMAT = "HH:mm"

export function isValidDateKey(date: unknown): date is string {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && moment.utc(date, DATE_FORMAT, true).isValid()
}

export function isValidTimezone(timezone: unknown): timezone is string {
  return typeof timezone === "string" && Boolean(moment.tz.zone(timezone))
}

export function parseMoscowSlot(date: unknown, time: unknown): AppointmentSlot | null {
  if (!isValidDateKey(date) || typeof time !== "string" || !SCHEDULE_TIMES.includes(time)) return null
  const local = moment.tz(`${date} ${time}`, `${DATE_FORMAT} ${TIME_FORMAT}`, true, APPOINTMENT_TIMEZONE)
  if (!local.isValid() || local.format(`${DATE_FORMAT} ${TIME_FORMAT}`) !== `${date} ${time}`) return null
  return { startsAt: local.toISOString(), bookingDate: date, timeMSK: time, status: "available" }
}

/** Parse an existing stored booking timestamp, including legacy off-grid rows. */
export function getStoredBookingInstant(date: string, time: string): string | null {
  if (!isValidDateKey(date) || typeof time !== "string") return null
  const clock = time.length === 5 ? `${time}:00` : time
  const local = moment.tz(`${date} ${clock}`, "YYYY-MM-DD HH:mm:ss", true, APPOINTMENT_TIMEZONE)
  if (!local.isValid() || local.format("YYYY-MM-DD HH:mm:ss") !== `${date} ${clock}`) return null
  return local.toISOString()
}

/** Accept an explicit-zone ISO instant only when it identifies an exact Moscow grid start. */
export function parseAppointmentInstant(value: unknown): AppointmentSlot | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null
  const instant = moment.parseZone(value, moment.ISO_8601, true)
  if (!instant.isValid() || instant.seconds() !== 0 || instant.milliseconds() !== 0) return null
  const moscow = instant.clone().tz(APPOINTMENT_TIMEZONE)
  const slot = parseMoscowSlot(moscow.format(DATE_FORMAT), moscow.format(TIME_FORMAT))
  if (!slot || Date.parse(slot.startsAt) !== instant.valueOf()) return null
  return slot
}

export function formatInstantInZone(startsAt: string, timezone: string): { date: string; time: string } | null {
  if (!isValidTimezone(timezone)) return null
  const instant = moment.parseZone(startsAt, moment.ISO_8601, true)
  if (!instant.isValid()) return null
  return { date: instant.clone().tz(timezone).format(DATE_FORMAT), time: instant.clone().tz(timezone).format(TIME_FORMAT) }
}

function statusForStart(startsAt: string, nowMs: number, occupied: Map<string, OccupiedSlot["kind"]>): AppointmentSlotStatus {
  const timestamp = Date.parse(startsAt)
  if (timestamp <= nowMs) return "past"
  if (timestamp < nowMs + MIN_BOOKING_NOTICE_MS) return "too_soon"
  return occupied.get(startsAt) ?? "available"
}

/** Generate all Moscow grid starts that fall inside one calendar day in the display zone. */
export function getSlotsForDisplayDay(
  displayDate: string,
  timezone: string,
  nowMs: number,
  occupancy: OccupiedSlot[] = [],
): AppointmentSlot[] {
  if (!isValidDateKey(displayDate) || !isValidTimezone(timezone) || !Number.isFinite(nowMs)) return []

  const dayStart = moment.tz(displayDate, DATE_FORMAT, true, timezone).startOf("day")
  if (!dayStart.isValid()) return []
  const nextDayStart = dayStart.clone().add(1, "day").startOf("day")
  const firstMoscowDay = dayStart.clone().tz(APPOINTMENT_TIMEZONE).startOf("day")
  const lastMoscowDay = nextDayStart.clone().subtract(1, "millisecond").tz(APPOINTMENT_TIMEZONE).startOf("day")
  const occupied = indexOccupancyByInstant(occupancy)
  const candidates: AppointmentSlot[] = []

  for (const moscowDay = firstMoscowDay.clone(); moscowDay.valueOf() <= lastMoscowDay.valueOf(); moscowDay.add(1, "day")) {
    const bookingDate = moscowDay.format(DATE_FORMAT)
    for (const timeMSK of SCHEDULE_TIMES) {
      const slot = parseMoscowSlot(bookingDate, timeMSK)
      if (!slot) continue
      const timestamp = Date.parse(slot.startsAt)
      if (timestamp < dayStart.valueOf() || timestamp >= nextDayStart.valueOf()) continue
      candidates.push({ ...slot, status: statusForStart(slot.startsAt, nowMs, occupied) })
    }
  }
  return candidates.sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
}

export function getDisplayDayInterval(displayDate: string, timezone: string): InstantInterval | null {
  if (!isValidDateKey(displayDate) || !isValidTimezone(timezone)) return null
  const start = moment.tz(displayDate, DATE_FORMAT, true, timezone).startOf("day")
  if (!start.isValid()) return null
  return { startsAtOrAfter: start.toISOString(), before: start.clone().add(1, "day").startOf("day").toISOString() }
}

export function getEarliestAvailableSlot(slots: AppointmentSlot[]): AppointmentSlot | null {
  return slots.find(slot => slot.status === "available") ?? null
}

export function getSlotStatus(startsAt: string, nowMs: number, occupancy: OccupiedSlot[] = []): AppointmentSlotStatus {
  const occupied = indexOccupancyByInstant(occupancy)
  return statusForStart(startsAt, nowMs, occupied)
}

export function dateKeyToCalendarDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export function calendarDateToDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
