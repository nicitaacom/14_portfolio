import type { TBookingRow } from "../types/TBookingRow"

/** Booking wall-clock values are stored in Moscow time, UTC+03:00. */
export function getBookingTimestamp(booking: Pick<TBookingRow, "booking_date" | "booking_time_MSK">) {
  return Date.parse(`${booking.booking_date}T${booking.booking_time_MSK}+03:00`)
}

export function splitBookingsByTime(bookings: TBookingRow[], now: number) {
  const upcoming: { booking: TBookingRow; timestamp: number }[] = []
  const past: { booking: TBookingRow; timestamp: number }[] = []
  for (const booking of bookings) {
    const timestamp = getBookingTimestamp(booking)
    if (!Number.isFinite(timestamp)) continue
    if (timestamp >= now) upcoming.push({ booking, timestamp })
    else past.push({ booking, timestamp })
  }

  upcoming.sort((a, b) => a.timestamp - b.timestamp)
  past.sort((a, b) => b.timestamp - a.timestamp)

  return {
    upcomingBookings: upcoming.map(({ booking }) => booking),
    pastBookings: past.map(({ booking }) => booking),
  }
}
