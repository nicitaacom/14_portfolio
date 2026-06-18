"use client"

import { useScopedI18n } from "@/locales/client"
import type { TBookingRow } from "../types/TBookingRow"
import { useBookingsView } from "../hooks/useBookingsView"
import { DashboardCard } from "./DashboardCard"
import { OverviewStat } from "./OverviewStat"
import { BookingItem } from "./BookingItem"

export function BookedAppointmentsSection({ bookings }: { bookings: TBookingRow[] }) {
  const t = useScopedI18n("admin")
  const { bookingsView, setBookingsView, upcomingBookings, pastBookings } = useBookingsView(bookings)

  return (
    <DashboardCard title={t("bookedAppointments")} subtitle={t("bookedAppointmentsSubtitle")}>
      <div className="mb-[4px] grid grid-cols-3 gap-[4px]">
        <OverviewStat label={t("upcoming")} value={upcomingBookings.length} />
        <OverviewStat label={t("past")} value={pastBookings.length} />
        <OverviewStat label={t("total")} value={bookings.length} />
      </div>

      <div className="mb-[4px] flex gap-[4px]">
        <button
          type="button"
          className={`rounded-[2px] border px-[10px] py-[6px] text-xs transition ${
            bookingsView === "upcoming"
              ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
              : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
          }`}
          onClick={() => setBookingsView("upcoming")}>
          {t("upcoming")}
        </button>
        <button
          type="button"
          className={`rounded-[2px] border px-[10px] py-[6px] text-xs transition ${
            bookingsView === "past"
              ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
              : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
          }`}
          onClick={() => setBookingsView("past")}>
          {t("past")}
        </button>
      </div>

      <div className="admin-dashboard-scrollbar max-h-[860px] overflow-auto pr-xs">
        {bookingsView === "upcoming" && upcomingBookings.length === 0 && (
          <p className="py-lg text-center text-sm text-secondary-foreground">{t("noUpcomingBookings")}</p>
        )}
        {bookingsView === "past" && pastBookings.length === 0 && (
          <p className="py-lg text-center text-sm text-secondary-foreground">{t("noPastBookings")}</p>
        )}
        <div className="flex flex-col gap-[4px]">
          {bookingsView === "upcoming"
            ? upcomingBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)
            : pastBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)}
        </div>
      </div>
    </DashboardCard>
  )
}
