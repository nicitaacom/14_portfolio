"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useScopedI18n } from "@/locales/client"
import type { TBookingRow } from "../types/TBookingRow"
import { useBookingsView } from "../hooks/useBookingsView"
import { BookingItem } from "./BookingItem"
import { adminUi, RefreshButton } from "./AdminUI"

export function BookedAppointmentsSection({ bookings, loadError = false }: { bookings: TBookingRow[]; loadError?: boolean }) {
  const t = useScopedI18n("adminConsole")
  const router = useRouter()
  const [refreshing, startRefresh] = useTransition()
  const { bookingsView, setBookingsView, upcomingBookings, pastBookings } = useBookingsView(bookings)
  const visible = bookingsView === "upcoming" ? upcomingBookings : pastBookings

  return (
    <div className={adminUi.stack}>
      <div className={adminUi.toolbar}>
        <div className={`${adminUi.segmented} !gap-0`} role="group" aria-label={t("bookings")}>
          <button className="px-sm" type="button" aria-pressed={bookingsView === "upcoming"} onClick={() => setBookingsView("upcoming")}>{t("upcoming")}</button>
          <button className="px-sm" type="button" aria-pressed={bookingsView === "past"} onClick={() => setBookingsView("past")}>{t("past")}</button>
        </div>
        <RefreshButton pending={refreshing} onClick={() => startRefresh(() => router.refresh())} />
      </div>
      {loadError ? (
        <p className={adminUi.error} role="alert">{t("bookingsLoadFailed")}</p>
      ) : (
        <>
          <dl className={`${adminUi.metrics} laptop:grid-cols-3`}>
            {[["upcoming", upcomingBookings.length], ["past", pastBookings.length], ["total", bookings.length]].map(([label, value]) => <div key={String(label)}><dt className="font-typewriter text-[10px] uppercase tracking-[1px] text-[var(--3d-dot-c-a8b1b9)]">{t(label as "upcoming")}</dt><dd className="mt-xs text-[25px] leading-tight text-[var(--3d-dot-c-eff3f6)] tablet:text-[31px]">{value}</dd></div>)}
          </dl>
          <div className={adminUi.stack} aria-busy={refreshing}>
            {visible.length ? visible.map(booking => <BookingItem key={booking.id} booking={booking} />) : (
              <p className={adminUi.empty}>{t(bookingsView === "upcoming" ? "noUpcomingBookings" : "noPastBookings")}</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
