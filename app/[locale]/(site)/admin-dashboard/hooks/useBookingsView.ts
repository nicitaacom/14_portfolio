"use client"

import { useEffect, useMemo, useState } from "react"
import type { TBookingRow } from "../types/TBookingRow"
import type { TBookingsView } from "../types/TBookingsView"
import { splitBookingsByTime } from "../utils/bookingTime"

export function useBookingsView(bookings: TBookingRow[]) {
  const [bookingsView, setBookingsView] = useState<TBookingsView>("upcoming")
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const update = () => setNow(Date.now())
    const timer = window.setInterval(update, 30_000)
    document.addEventListener("visibilitychange", update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  const { upcomingBookings, pastBookings } = useMemo(() => splitBookingsByTime(bookings, now), [bookings, now])

  return { bookingsView, setBookingsView, upcomingBookings, pastBookings }
}
