"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { useBookingActions } from "../../hooks/useBookingActions"
import type { TBookingRow } from "../types/TBookingRow"
import { BookingChannelBadge } from "./BookingChannelBadge"
import { BookingContactRow } from "./BookingContactRow"
import { formatDate, formatDateTime } from "../utils/adminFormatters"
import { adminUi } from "./AdminUI"

export function BookingItem({ booking }: { booking: TBookingRow }) {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draftBookingDate, setDraftBookingDate] = useState(booking.booking_date)
  const [draftBookingTime, setDraftBookingTime] = useState(booking.booking_time_MSK.slice(0, 5))
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const action = useRef<"update" | "delete">("update")
  const editButton = useRef<HTMLButtonElement>(null)

  const refresh = () => startRefresh(() => router.refresh())
  const { isLoading, deleteBooking, updateBooking } = useBookingActions({
    onDeleteSuccess: refresh,
    onUpdateSuccess: () => {
      setIsEditing(false)
      refresh()
    },
    onError: () => setError(t(action.current === "delete" ? "bookingDeleteFailed" : "bookingUpdateFailed")),
  })
  const pending = isLoading || isRefreshing

  function resetDraft() {
    setDraftBookingDate(booking.booking_date)
    setDraftBookingTime(booking.booking_time_MSK.slice(0, 5))
    setError(null)
  }

  function cancelEditing() {
    resetDraft()
    setIsEditing(false)
    requestAnimationFrame(() => editButton.current?.focus())
  }

  function saveBookingChanges() {
    action.current = "update"
    setError(null)
    void updateBooking(booking.id, draftBookingDate, draftBookingTime, formatDate(booking.booking_date), booking.booking_time_MSK)
  }

  function handleDelete() {
    action.current = "delete"
    setError(null)
    void deleteBooking(booking.id, formatDate(booking.booking_date), booking.booking_time_MSK)
  }

  return (
    <article className={adminUi.panel} aria-busy={pending}>
      <header className={adminUi.panelHeader}>
        <div className="flex flex-wrap items-center gap-sm">
          <strong>{formatDate(booking.booking_date, locale)}</strong>
          <span className={adminUi.mono}>{booking.booking_time_MSK.slice(0, 5)} {t("moscowTimeZone")}</span>
          <BookingChannelBadge channel={booking.channel} />
        </div>
        {!isEditing && !confirmDelete && <div className="flex flex-wrap items-center gap-sm">
          <button className={adminUi.button} type="button" ref={editButton} disabled={pending} onClick={() => {
            resetDraft()
            setIsEditing(true)
          }}>{t("editBooking")}</button>
          <button className={`${adminUi.button} border-[var(--3d-dot-c-78524f)] bg-[linear-gradient(var(--3d-dot-c-3b2c2e),var(--3d-dot-c-2e2528))] text-[var(--3d-dot-c-efb0aa)]`} type="button" disabled={pending} onClick={() => {
            setError(null)
            setConfirmDelete(true)
          }}>{t("deleteBooking")}</button>
        </div>}
      </header>

      <BookingContactRow contact={booking.contact} contactType={booking.contact_type} />

      {isEditing && (
        <form className={adminUi.stack} onSubmit={event => { event.preventDefault(); saveBookingChanges() }}>
          <div className="grid grid-cols-1 gap-sm tablet:grid-cols-2">
            <label className={adminUi.field}><span>{t("bookingDate")}</span>
              <input className={adminUi.input} type="date" value={draftBookingDate} required disabled={pending}
                onChange={event => setDraftBookingDate(event.target.value)} />
            </label>
            <label className={adminUi.field}><span>{t("bookingTimeMSK")}</span>
              <input className={adminUi.input} type="time" value={draftBookingTime} required disabled={pending}
                onChange={event => setDraftBookingTime(event.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <button className={`${adminUi.button} border-[var(--3d-dot-c-f0f3f5)] bg-[linear-gradient(var(--3d-dot-c-e7ebee),var(--3d-dot-c-bec7ce))] text-[var(--3d-dot-c-15191d)]`} type="submit" disabled={pending || !draftBookingDate || !draftBookingTime}>
              {pending ? t("pending") : t("saveBooking")}
            </button>
            <button className={adminUi.button} type="button" disabled={pending} onClick={cancelEditing}>{t("cancelEditing")}</button>
          </div>
        </form>
      )}

      {confirmDelete && (
        <div className={adminUi.stack}>
          <p>{t("deleteBookingConfirm")}</p>
          <div className="flex flex-wrap items-center gap-sm">
            <button className={`${adminUi.button} border-[var(--3d-dot-c-78524f)] bg-[linear-gradient(var(--3d-dot-c-3b2c2e),var(--3d-dot-c-2e2528))] text-[var(--3d-dot-c-efb0aa)]`} type="button" disabled={pending} onClick={handleDelete}>
              {pending ? t("pending") : t("deleteBooking")}
            </button>
            <button className={adminUi.button} type="button" disabled={pending} onClick={() => {
              setConfirmDelete(false)
              setError(null)
            }}>{t("keepBooking")}</button>
          </div>
        </div>
      )}

      {error && <p className={`${adminUi.error} mt-sm`} role="alert">{error}</p>}

      <details className="mt-sm border-t border-[var(--3d-dot-c-3c454d)] pt-sm text-[11px] text-[var(--3d-dot-c-a7b4bf)]">
        <summary className="cursor-pointer text-[var(--3d-dot-c-b8c5cf)]">{t("showDetails")}</summary>
        <dl className="mt-sm grid grid-cols-[90px_minmax(0,1fr)] gap-x-4 gap-y-2 [&_dt]:text-[var(--3d-dot-c-95a7b5)] [&_dd]:min-w-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-[var(--3d-dot-c-c6d6e2)]">
          <div className="contents"><dt>{t("created")}</dt><dd>{formatDateTime(booking.created_at, "—", locale)}</dd></div>
          <div className="contents"><dt>{t("bookingId")}</dt><dd className={adminUi.mono}>{booking.id}</dd></div>
        </dl>
      </details>
    </article>
  )
}
