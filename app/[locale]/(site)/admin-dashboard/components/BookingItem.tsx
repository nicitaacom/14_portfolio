"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FiEdit3, FiSave } from "react-icons/fi"
import { MdOutlineCancel } from "react-icons/md"
import { Input } from "@/components/Input"
import { useScopedI18n } from "@/locales/client"
import { useBookingActions } from "../../hooks/useBookingActions"
import type { TBookingRow } from "../types/TBookingRow"
import { BookingChannelBadge } from "./BookingChannelBadge"
import { BookingContactRow } from "./BookingContactRow"
import { formatDate, formatDateTime } from "../utils/adminFormatters"

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[84px_1fr] items-center gap-xs text-xs">
      <span className="truncate whitespace-nowrap uppercase tracking-[0.14em] text-secondary-foreground">{label}</span>
      <span className={`truncate whitespace-nowrap text-secondary ${mono ? "font-mono" : ""}`} title={value}>
        {value}
      </span>
    </div>
  )
}

function BookingControlChip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-[40px] shrink-0 items-center rounded-[2px] border border-[#343434] bg-[#232323] px-sm ${className}`}>
      {children}
    </div>
  )
}

export function BookingItem({ booking }: { booking: TBookingRow }) {
  const t = useScopedI18n("admin")
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [draftBookingDate, setDraftBookingDate] = useState(booking.booking_date)
  const [draftBookingTime, setDraftBookingTime] = useState(booking.booking_time_MSK.slice(0, 5))

  const { isLoading, deleteBooking, updateBooking } = useBookingActions({
    onDeleteSuccess: () => router.refresh(),
    onUpdateSuccess: () => { setIsEditing(false); router.refresh() },
  })

  function saveBookingChanges() {
    updateBooking(booking.id, draftBookingDate, draftBookingTime, formatDate(booking.booking_date), booking.booking_time_MSK)
  }

  function handleDelete() {
    deleteBooking(booking.id, formatDate(booking.booking_date), booking.booking_time_MSK)
  }

  return (
    <article className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-sm">
      <div className="flex flex-col gap-[4px]">
        <div className="admin-dashboard-scrollbar overflow-x-auto pb-[4px]">
          <div className="flex min-w-max items-center gap-[4px]">
            <BookingControlChip className="w-[152px] justify-between">
              {isEditing ? (
                <Input
                  type="date"
                  value={draftBookingDate}
                  onChange={event => setDraftBookingDate(event.target.value)}
                  className="w-full border-none px-0 py-0"
                />
              ) : (
                <p className="truncate whitespace-nowrap text-sm text-secondary">{formatDate(booking.booking_date)}</p>
              )}
            </BookingControlChip>

            <BookingControlChip className="w-[128px] justify-between">
              {isEditing ? (
                <Input
                  type="time"
                  value={draftBookingTime}
                  onChange={event => setDraftBookingTime(event.target.value)}
                  className="w-full border-none px-0 py-0"
                />
              ) : (
                <p className="truncate whitespace-nowrap text-sm text-secondary">
                  {booking.booking_time_MSK.slice(0, 5)} MSK
                </p>
              )}
            </BookingControlChip>

            <BookingControlChip>
              <BookingChannelBadge channel={booking.channel} />
            </BookingControlChip>

            {isEditing ? (
              <>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-success/40 bg-[#14281a] text-success transition-opacity disabled:opacity-50"
                  disabled={isLoading || !draftBookingDate || !draftBookingTime}
                  onClick={saveBookingChanges}
                  type="button">
                  <FiSave size={16} />
                </button>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-secondary-foreground/30 bg-[#2b2b2b] text-secondary transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => setIsEditing(false)}
                  type="button">
                  <MdOutlineCancel size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-cta/40 bg-[#2f203d] text-cta transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => setIsEditing(true)}
                  type="button">
                  <FiEdit3 size={16} />
                </button>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-danger/40 bg-[#321b1f] text-danger transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                  onClick={handleDelete}
                  type="button">
                  <MdOutlineCancel size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-[#2e2e2e]"></div>

        <div className="flex flex-col gap-[4px] pt-[4px]">
          <p className="truncate whitespace-nowrap text-xs" title={formatDateTime(booking.created_at)}>
            {t("created")} {formatDateTime(booking.created_at)}
          </p>
          <DetailRow label={t("bookingId")} value={booking.id} mono />
          <BookingContactRow contact={booking.contact} contactType={booking.contact_type} />
        </div>
      </div>
    </article>
  )
}
