"use client"

import { useEffect, useMemo, useState } from "react"
import type { TBookingRow } from "../types/TBookingRow"
import type { TBookingsView } from "../types/TBookingsView"
import { getBookingTimestamp, splitBookingsByTime } from "../utils/bookingTime"

export function useBookingsView(bookings: TBookingRow[]) {
  const [bookingsView, setBookingsView] = useState<TBookingsView>("upcoming")
  const [now, setNow] = useState(() => Date.now())

  const nextUpcomingTimestamp = useMemo(() => {
    let next: number | null = null
    for (const booking of bookings) {
      const timestamp = getBookingTimestamp(booking)
      if (timestamp >= now && (next === null || timestamp < next)) next = timestamp
    }
    return next
  }, [bookings, now])

  useEffect(() => {
    const updateWhenVisible = () => {
      if (document.visibilityState === "visible") setNow(Date.now())
    }
    const delay = nextUpcomingTimestamp === null
      ? null
      : Math.min(Math.max(nextUpcomingTimestamp - Date.now() + 1, 0), 2_147_483_647)
    const timer = delay === null ? null : window.setTimeout(updateWhenVisible, delay)
    document.addEventListener("visibilitychange", updateWhenVisible)
    window.addEventListener("focus", updateWhenVisible)
    return () => {
      if (timer !== null) window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", updateWhenVisible)
      window.removeEventListener("focus", updateWhenVisible)
    }
  }, [nextUpcomingTimestamp])

  const { upcomingBookings, pastBookings } = useMemo(() => splitBookingsByTime(bookings, now), [bookings, now])

  return { bookingsView, setBookingsView, upcomingBookings, pastBookings }
}
