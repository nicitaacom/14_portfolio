"use client"

import { memo, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { useBookingActions } from "../../hooks/useBookingActions"
import type { TBookingRow } from "../types/TBookingRow"
import { BookingChannelBadge } from "./BookingChannelBadge"
import { BookingContactRow } from "./BookingContactRow"
import { formatDate, formatDateTime } from "../utils/adminFormatters"
import { adminUi } from "./AdminUI"
import { getStoredBookingInstant, type AppointmentSlot } from "@/libs/appointmentSlots"

type AdminSlot = Pick<AppointmentSlot, "startsAt" | "bookingDate" | "timeMSK"> & {
  occupancy: "free" | "booked" | "blocked"
  eligibility: "eligible" | "too_soon" | "past"
}

export const BookingItem = memo(function BookingItem({ booking }: { booking: TBookingRow }) {
  const t = useScopedI18n("adminConsole")
  const availabilityT = useScopedI18n("appointment.availability")
  const locale = useCurrentLocale()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draftBookingDate, setDraftBookingDate] = useState(booking.booking_date)
  const [draftStartsAt, setDraftStartsAt] = useState(getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK) ?? "")
  const [draftSlots, setDraftSlots] = useState<AdminSlot[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const availabilityRequest = useRef(0)
  const editButton = useRef<HTMLButtonElement>(null)
  const pending = isRefreshing || availabilityLoading
  const refresh = () => startRefresh(() => router.refresh())

  const { isLoading, deleteBooking, updateBooking } = useBookingActions({
    onDeleteSuccess: refresh,
    onUpdateSuccess: result => {
      setIsEditing(false)
      setError(result.notificationError ?? null)
      refresh()
    },
    onUpdateFailure: result => {
      const code = result.code && ["SLOT_IN_PAST", "SLOT_TOO_SOON", "SLOT_BLOCKED", "SLOT_BOOKED", "SLOT_UNAVAILABLE", "INVALID_SLOT", "SELECTION_REFRESH_REQUIRED", "AVAILABILITY_UNAVAILABLE"].includes(result.code)
        ? result.code as API.SlotFailureCode : null
      const messages: Record<API.SlotFailureCode, string> = {
        SLOT_IN_PAST: availabilityT("SLOT_IN_PAST"), SLOT_TOO_SOON: availabilityT("SLOT_TOO_SOON"),
        SLOT_BLOCKED: availabilityT("SLOT_BLOCKED"), SLOT_BOOKED: availabilityT("SLOT_BOOKED"),
        SLOT_UNAVAILABLE: availabilityT("SLOT_UNAVAILABLE"), INVALID_SLOT: availabilityT("INVALID_SLOT"),
        SELECTION_REFRESH_REQUIRED: availabilityT("SELECTION_REFRESH_REQUIRED"), AVAILABILITY_UNAVAILABLE: availabilityT("AVAILABILITY_UNAVAILABLE"),
      }
      setError(code ? messages[code] : result.error ?? t("bookingUpdateFailed"))
    },
    onDeleteFailure: result => setError(result.error ?? t("bookingDeleteFailed")),
    onError: () => setError(t("actionFailed")),
  })

  useEffect(() => {
    if (!isEditing || !draftBookingDate) return
    const requestId = ++availabilityRequest.current
    setAvailabilityLoading(true)
    setError(null)
    const query = new URLSearchParams({ date: draftBookingDate, timezone: "Europe/Moscow", excludeBookingId: booking.id })
    fetch(`/api/admin/appointment-slots?${query.toString()}`, { cache: "no-store" })
      .then(async response => {
        const result = await response.json() as { ok: boolean; slots?: AdminSlot[] }
        if (!response.ok || !result.ok || !result.slots) throw new Error(t("availabilityLoadFailed"))
        if (requestId !== availabilityRequest.current) return
        setDraftSlots(result.slots)
        const available = result.slots.filter(slot => slot.occupancy === "free" && slot.eligibility === "eligible")
        const oldStartsAt = getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK)
        setDraftStartsAt(available.some(slot => slot.startsAt === oldStartsAt) ? oldStartsAt! : available[0]?.startsAt ?? "")
      })
      .catch(reason => { if (requestId === availabilityRequest.current) setError(reason instanceof Error ? reason.message : t("availabilityLoadFailed")) })
      .finally(() => { if (requestId === availabilityRequest.current) setAvailabilityLoading(false) })
    return () => { availabilityRequest.current += 1 }
  }, [isEditing, draftBookingDate, booking.id, booking.booking_date, booking.booking_time_MSK, t])

  function resetDraft() {
    setDraftBookingDate(booking.booking_date)
    setDraftStartsAt(getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK) ?? "")
    setError(null)
  }

  function cancelEditing() {
    resetDraft()
    setIsEditing(false)
    requestAnimationFrame(() => editButton.current?.focus())
  }

  function saveBookingChanges() {
    setError(null)
    updateBooking(booking.id, draftStartsAt)
  }

  function handleDelete() {
    setError(null)
    deleteBooking(booking.id)
  }

  const available = draftSlots.filter(slot => slot.occupancy === "free" && slot.eligibility === "eligible")

  return (
    <article className={adminUi.panel} aria-busy={pending || isLoading}>
      <header className={adminUi.panelHeader}>
        <div className="flex flex-wrap items-center gap-sm">
          <strong>{formatDate(booking.booking_date, locale)}</strong>
          <span className={adminUi.mono}>{booking.booking_time_MSK.slice(0, 5)} {t("moscowTimeZone")}</span>
          <BookingChannelBadge channel={booking.channel} />
        </div>
        {!isEditing && !confirmDelete && <div className="flex flex-wrap items-center gap-sm">
          <button className={adminUi.button} type="button" ref={editButton} disabled={isLoading} onClick={() => { resetDraft(); setIsEditing(true) }}>{t("editBooking")}</button>
          <button className={`${adminUi.button} border-[var(--3d-dot-c-78524f)] bg-[linear-gradient(var(--3d-dot-c-3b2c2e),var(--3d-dot-c-2e2528))] text-[var(--3d-dot-c-efb0aa)]`} type="button" disabled={isLoading} onClick={() => { setError(null); setConfirmDelete(true) }}>{t("deleteBooking")}</button>
        </div>}
      </header>

      <BookingContactRow contact={booking.contact} contactType={booking.contact_type} />

      {isEditing && <form className={adminUi.stack} onSubmit={event => { event.preventDefault(); saveBookingChanges() }}>
        <div className="grid grid-cols-1 gap-sm tablet:grid-cols-2">
          <label className={adminUi.field}><span>{t("bookingDate")}</span>
            <input className={adminUi.input} type="date" value={draftBookingDate} required disabled={isLoading}
              onChange={event => { setDraftBookingDate(event.target.value); setDraftStartsAt("") }} />
          </label>
          <label className={adminUi.field}><span>{t("bookingTimeMSK")}</span>
            <select className={adminUi.input} value={draftStartsAt} required disabled={isLoading || availabilityLoading} onChange={event => setDraftStartsAt(event.target.value)}>
              <option value="">{availabilityLoading ? t("refreshing") : "—"}</option>
              {draftSlots.map(slot => {
                const eligible = slot.occupancy === "free" && slot.eligibility === "eligible"
                const suffix = slot.occupancy === "booked" ? t("booked") : slot.occupancy === "blocked" ? t("blocked") : slot.eligibility === "too_soon" ? t("tooSoon") : slot.eligibility === "past" ? t("past") : t("free")
                return <option key={slot.startsAt} value={slot.startsAt} disabled={!eligible}>{slot.timeMSK} {t("moscowTimeZone")} · {suffix}</option>
              })}
            </select>
            {!available.length && !availabilityLoading && <small className="text-[var(--3d-dot-c-a1a7ae)]">{t("noAvailabilitySlots")}</small>}
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <button className={`${adminUi.button} border-[var(--3d-dot-c-f0f3f5)] bg-[linear-gradient(var(--3d-dot-c-e7ebee),var(--3d-dot-c-bec7ce))] text-[var(--3d-dot-c-15191d)]`} type="submit" disabled={isLoading || availabilityLoading || !draftBookingDate || !draftStartsAt}>
            {isLoading ? t("pending") : t("saveBooking")}
          </button>
          <button className={adminUi.button} type="button" disabled={isLoading} onClick={cancelEditing}>{t("cancelEditing")}</button>
        </div>
      </form>}

      {confirmDelete && <div className={adminUi.stack}>
        <p>{t("deleteBookingConfirm")}</p>
        <div className="flex flex-wrap items-center gap-sm">
          <button className={`${adminUi.button} border-[var(--3d-dot-c-78524f)] bg-[linear-gradient(var(--3d-dot-c-3b2c2e),var(--3d-dot-c-2e2528))] text-[var(--3d-dot-c-efb0aa)]`} type="button" disabled={isLoading} onClick={handleDelete}>{isLoading ? t("pending") : t("deleteBooking")}</button>
          <button className={adminUi.button} type="button" disabled={isLoading} onClick={() => { setConfirmDelete(false); setError(null) }}>{t("keepBooking")}</button>
        </div>
      </div>}

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
})
