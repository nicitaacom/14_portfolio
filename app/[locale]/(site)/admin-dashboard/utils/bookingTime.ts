import type { TBookingRow } from "../types/TBookingRow"

/** Booking wall-clock values are stored in Moscow time, UTC+03:00. */
export function getBookingTimestamp(booking: Pick<TBookingRow, "booking_date" | "booking_time_MSK">) {
  return Date.parse(`${booking.booking_date}T${booking.booking_time_MSK}+03:00`)
}

export function splitBookingsByTime(bookings: TBookingRow[], now: number) {
  const upcomingBookings = bookings
    .filter(booking => getBookingTimestamp(booking) >= now)
    .sort((a, b) => getBookingTimestamp(a) - getBookingTimestamp(b))
  const pastBookings = bookings
    .filter(booking => getBookingTimestamp(booking) < now)
    .sort((a, b) => getBookingTimestamp(b) - getBookingTimestamp(a))

  return { upcomingBookings, pastBookings }
}
