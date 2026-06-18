"use client"

import { useMemo, useState } from "react"
import type { TBookingRow } from "../types/TBookingRow"
import type { TBookingsView } from "../types/TBookingsView"

export function useBookingsView(bookings: TBookingRow[]) {
  const [bookingsView, setBookingsView] = useState<TBookingsView>("upcoming")

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date()
    const upcoming = bookings.filter(
      booking => new Date(`${booking.booking_date}T${booking.booking_time_MSK}`) >= now,
    )
    const past = bookings
      .filter(booking => new Date(`${booking.booking_date}T${booking.booking_time_MSK}`) < now)
      .sort(
        (a, b) =>
          new Date(`${b.booking_date}T${b.booking_time_MSK}`).getTime() -
          new Date(`${a.booking_date}T${a.booking_time_MSK}`).getTime(),
      )
    return { upcomingBookings: upcoming, pastBookings: past }
  }, [bookings])

  return { bookingsView, setBookingsView, upcomingBookings, pastBookings }
}
