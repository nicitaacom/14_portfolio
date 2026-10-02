"use client"

import { memo, useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import moment from "moment-timezone"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { FiEdit3, FiSave } from "react-icons/fi"
import { MdOutlineCancel } from "react-icons/md"
import { SiGooglemeet } from "react-icons/si"

import { BookingsResponse } from "@/interfaces/BookingsResponse"
import { Button } from "@/components/Button"
import useToast from "@/store/useToast"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { useBookingActions } from "../../hooks/useBookingActions"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { formatInstantInZone, getStoredBookingInstant, type AppointmentSlot } from "@/libs/appointmentSlots"
import { fetchAppointmentAvailability } from "../hooks/appointmentAvailabilityClient"

const EMPTY_APPOINTMENT_SLOTS: AppointmentSlot[] = []

const BookingAppointmentRow = memo(function BookingAppointmentRow({
  availabilityError,
  availabilityLoading,
  booking,
  draftBookingDate,
  draftStartsAt,
  editSlots,
  isEditing,
  isLoading,
  onChangeDate,
  onChangeStartsAt,
  onDelete,
  onRetryAvailability,
  onSave,
  onStartEditing,
  onStopEditing,
  timezone,
}: {
  availabilityError: boolean
  availabilityLoading: boolean
  booking: BookingsResponse
  draftBookingDate: string
  draftStartsAt: string
  editSlots: AppointmentSlot[]
  isEditing: boolean
  isLoading: boolean
  onChangeDate: (booking: BookingsResponse, date: string) => void
  onChangeStartsAt: (startsAt: string) => void
  onDelete: (bookingId: string) => void
  onRetryAvailability: (booking: BookingsResponse, date: string) => void
  onSave: (bookingId: string, startsAt: string) => void
  onStartEditing: (booking: BookingsResponse) => void
  onStopEditing: () => void
  timezone: string
}) {
  const locale = useCurrentLocale()
  const t = useScopedI18n("appointment.page")
  const commonT = useScopedI18n("common")
  const labels = {
    available: t("slotAvailable"),
    booked: t("slotBooked"),
    blocked: t("slotBlocked"),
    too_soon: t("slotTooSoon"),
    past: t("slotPast"),
  }
  const handleStartEditing = useCallback(() => onStartEditing(booking), [booking, onStartEditing])
  const handleDelete = useCallback(() => onDelete(booking.id), [booking.id, onDelete])
  const handleSave = useCallback(() => onSave(booking.id, draftStartsAt), [booking.id, draftStartsAt, onSave])
  const handleRetry = useCallback(() => onRetryAvailability(booking, draftBookingDate), [booking, draftBookingDate, onRetryAvailability])
  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => onChangeDate(booking, event.target.value), [booking, onChangeDate])
  const handleStartsAtChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => onChangeStartsAt(event.target.value), [onChangeStartsAt])
  const startsAt = getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK)
  const display = startsAt ? formatInstantInZone(startsAt, timezone) : null
  const bookingTimeLabel = display
    ? t("bookedDateAt", { date: moment.utc(display.date).format("DD.MM.YYYY"), time: display.time, timezone })
    : `${booking.booking_date} ${booking.booking_time_MSK}`

  return <li className="appointment-booking-card machine-bezel flex min-w-0 flex-col gap-xs px-sm py-sm">
    <div className="flex flex-col gap-xs">
      {isEditing ? <div className="flex flex-col gap-xs">
        <label className="text-xs text-secondary-foreground">{t("appointmentDate")}
          <input className="mt-xs h-10 w-full rounded-md border border-brass/40 bg-steel px-sm text-secondary" type="date" value={draftBookingDate} disabled={isLoading} onChange={handleDateChange} />
        </label>
        <label className="text-xs text-secondary-foreground">{t("availableTimes")}
          <select className="mt-xs h-10 w-full rounded-md border border-brass/40 bg-steel px-sm text-secondary" value={draftStartsAt} disabled={isLoading || availabilityLoading || availabilityError} onChange={handleStartsAtChange}>
            <option value="">{availabilityLoading ? t("loadingAvailability") : availabilityError ? t("availabilityFailed") : t("selectTime")}</option>
            {editSlots.map(slot => {
              const slotDisplay = formatInstantInZone(slot.startsAt, timezone)
              return slotDisplay ? <option key={slot.startsAt} value={slot.startsAt} disabled={slot.status !== "available"}>{slotDisplay.date} · {slotDisplay.time} · {labels[slot.status]}</option> : null
            })}
          </select>
        </label>
        {availabilityError && <button type="button" className="min-h-10 self-start text-sm underline" onClick={handleRetry}>{t("retryAvailability")}</button>}
        <p className="text-xs text-secondary-foreground">{t("timeEditedIn", { timezone })}</p>
      </div> : <p className="text-sm leading-relaxed text-secondary">{bookingTimeLabel}</p>}
      <p className="flex flex-row items-center gap-sm text-sm leading-relaxed text-secondary-foreground">
        {commonT("channel")}: {booking.channel}
        {booking.channel === "google-meets" ? <SiGooglemeet className="text-[#00ac47]" /> : booking.channel === "discord" ? <FaDiscord className="text-[#5865f2]" /> : <FaTelegramPlane className="text-[#229ed9]" />}
      </p>
    </div>
    <div className="flex flex-row justify-end gap-x-xs">
      {isEditing ? <>
        <Button title={t("saveChanges")} className="h-[34px] w-[34px] border-success !p-xs" isDisabled={isLoading || !draftStartsAt || availabilityLoading || availabilityError} requestAction="compact" requestPending={isLoading} onClick={handleSave}><FiSave className="text-success" size={16} /></Button>
        <Button title={t("cancelEdit")} className="h-[34px] w-[34px] border-secondary-foreground !p-xs" isDisabled={isLoading} onClick={onStopEditing}><MdOutlineCancel size={16} /></Button>
      </> : <>
        <Button title={t("editAppointment")} className="h-[34px] w-[34px] border-cta !p-xs" isDisabled={isLoading} onClick={handleStartEditing}><FiEdit3 className="text-cta" size={16} /></Button>
        <Button title={t("deleteAppointment")} className="h-[34px] w-[34px] border-danger !p-xs" isDisabled={isLoading} requestAction="compact" requestPending={isLoading} onClick={handleDelete}><MdOutlineCancel className="text-danger" size={16} /></Button>
      </>}
    </div>
  </li>
})

function useBookedAppointmentEditHandlers({
  editRequest,
  selectedTimezone,
  setAvailabilityError,
  setAvailabilityLoading,
  setDraftBookingDate,
  setDraftStartsAt,
  setEditSlots,
  setEditingAppointmentId,
}: {
  editRequest: { current: number }
  selectedTimezone: string
  setAvailabilityError: (error: boolean) => void
  setAvailabilityLoading: (loading: boolean) => void
  setDraftBookingDate: (date: string) => void
  setDraftStartsAt: (startsAt: string) => void
  setEditSlots: (slots: AppointmentSlot[]) => void
  setEditingAppointmentId: (id: string | null) => void
}) {
  const stopEditing = useCallback(() => {
    editRequest.current += 1
    setEditingAppointmentId(null)
    setDraftBookingDate("")
    setDraftStartsAt("")
    setEditSlots([])
    setAvailabilityError(false)
  }, [editRequest, setAvailabilityError, setDraftBookingDate, setDraftStartsAt, setEditSlots, setEditingAppointmentId])

  const loadEditAvailability = useCallback(async (booking: BookingsResponse, date: string, keepCurrent: boolean) => {
    const request = ++editRequest.current
    setAvailabilityLoading(true)
    setAvailabilityError(false)
    try {
      const response = await fetchAppointmentAvailability(date, selectedTimezone, undefined, booking.id)
      if (request !== editRequest.current) return
      setEditSlots(response.slots)
      const oldStart = getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK)
      const oldOnThisDay = keepCurrent && oldStart && response.slots.some(slot => slot.startsAt === oldStart && slot.status === "available")
      setDraftStartsAt(oldOnThisDay ? oldStart : response.slots.find(slot => slot.status === "available")?.startsAt ?? "")
    } catch {
      if (request === editRequest.current) {
        setEditSlots([])
        setDraftStartsAt("")
        setAvailabilityError(true)
      }
    } finally {
      if (request === editRequest.current) setAvailabilityLoading(false)
    }
  }, [editRequest, selectedTimezone, setAvailabilityError, setAvailabilityLoading, setDraftStartsAt, setEditSlots])

  const startEditing = useCallback((booking: BookingsResponse) => {
    const startsAt = getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK)
    const display = startsAt ? formatInstantInZone(startsAt, selectedTimezone) : null
    const date = display?.date ?? moment.tz(booking.booking_date, "YYYY-MM-DD", true, selectedTimezone).format("YYYY-MM-DD")
    setEditingAppointmentId(booking.id)
    setDraftBookingDate(date)
    setDraftStartsAt(startsAt ?? "")
    if (startsAt) loadEditAvailability(booking, date, true)
  }, [loadEditAvailability, selectedTimezone, setDraftBookingDate, setDraftStartsAt, setEditingAppointmentId])

  const changeDraftDate = useCallback((booking: BookingsResponse, date: string) => {
    setDraftBookingDate(date)
    setDraftStartsAt("")
    if (date) loadEditAvailability(booking, date, false)
  }, [loadEditAvailability, setDraftBookingDate, setDraftStartsAt])

  const retryEditAvailability = useCallback((booking: BookingsResponse, date: string) => {
    loadEditAvailability(booking, date, true)
  }, [loadEditAvailability])

  return { changeDraftDate, loadEditAvailability, retryEditAvailability, startEditing, stopEditing }
}

function useBookingUpdateHandler(updateBooking: (bookingId: string, startsAt: string) => Promise<unknown>) {
  const saveBooking = useCallback((bookingId: string, startsAt: string) => {
    updateBooking(bookingId, startsAt)
  }, [updateBooking])

  return { saveBooking }
}

export function BookedAppointments({ booked_appointments }: { booked_appointments: BookingsResponse[] }) {
  const { selectedTimezone } = useAppointmentStore()
  const router = useRouter()
  const toast = useToast()
  const t = useScopedI18n("appointment.page")
  const toastT = useScopedI18n("toast")
  const availabilityT = useScopedI18n("appointment.availability")
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [draftBookingDate, setDraftBookingDate] = useState("")
  const [draftStartsAt, setDraftStartsAt] = useState("")
  const [editSlots, setEditSlots] = useState<AppointmentSlot[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState(false)
  const editRequest = useRef(0)
  const { changeDraftDate, loadEditAvailability, retryEditAvailability, startEditing, stopEditing } = useBookedAppointmentEditHandlers({
    editRequest,
    selectedTimezone,
    setAvailabilityError,
    setAvailabilityLoading,
    setDraftBookingDate,
    setDraftStartsAt,
    setEditSlots,
    setEditingAppointmentId,
  })

  const { isLoading, deleteBooking, updateBooking } = useBookingActions({
    onError: error => toast.show("error", toastT("defaultErrorTitle"), error.message),
    onDeleteSuccess: result => {
      router.refresh()
      if (result.notificationError) toast.show("warning", toastT("defaultWarningTitle"), result.notificationError)
    },
    onDeleteFailure: result => toast.show("error", toastT("defaultErrorTitle"), result.error ?? t("bookingActionFailed")),
    onUpdateFailure: result => {
      const code = result.code && ["SLOT_IN_PAST", "SLOT_TOO_SOON", "SLOT_BLOCKED", "SLOT_BOOKED", "SLOT_UNAVAILABLE", "INVALID_SLOT", "SELECTION_REFRESH_REQUIRED", "AVAILABILITY_UNAVAILABLE"].includes(result.code)
        ? result.code as API.SlotFailureCode : null
      const messages: Record<API.SlotFailureCode, string> = {
        SLOT_IN_PAST: availabilityT("SLOT_IN_PAST"), SLOT_TOO_SOON: availabilityT("SLOT_TOO_SOON"),
        SLOT_BLOCKED: availabilityT("SLOT_BLOCKED"), SLOT_BOOKED: availabilityT("SLOT_BOOKED"),
        SLOT_UNAVAILABLE: availabilityT("SLOT_UNAVAILABLE"), INVALID_SLOT: availabilityT("INVALID_SLOT"),
        SELECTION_REFRESH_REQUIRED: availabilityT("SELECTION_REFRESH_REQUIRED"), AVAILABILITY_UNAVAILABLE: availabilityT("AVAILABILITY_UNAVAILABLE"),
      }
      const message = code ? messages[code] : result.error ?? t("bookingActionFailed")
      toast.show("warning", toastT("defaultWarningTitle"), message)
    },
    onUpdateSuccess: result => {
      stopEditing()
      router.refresh()
      if (result.notificationError) toast.show("warning", toastT("defaultWarningTitle"), result.notificationError)
    },
  })

  const { saveBooking } = useBookingUpdateHandler(updateBooking)

  return (
    <div className="appointment-bookings-board workbench-board mx-auto w-full max-w-[680px] p-sm laptop:sticky laptop:top-[6rem] laptop:max-w-none">
      <div className="machine-panel p-sm">
        <div className="appointment-bookings-heading mb-xs">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary">{t("scheduledAppointments")}</p>
          <p className="mt-xs max-w-[22rem] text-sm leading-relaxed text-secondary-foreground/75">{t("scheduledAppointmentsSubtitle")}</p>
        </div>

        <ul className="flex flex-col gap-xs">
          {!booked_appointments.length && <li className="appointment-empty-card machine-bezel relative px-sm py-sm text-sm leading-relaxed text-secondary-foreground">{t("noAppointments")}</li>}
          {booked_appointments.map(booking => {
            const isEditing = editingAppointmentId === booking.id
            return <BookingAppointmentRow
              key={booking.id}
              availabilityError={isEditing && availabilityError}
              availabilityLoading={isEditing && availabilityLoading}
              booking={booking}
              draftBookingDate={isEditing ? draftBookingDate : ""}
              draftStartsAt={isEditing ? draftStartsAt : ""}
              editSlots={isEditing ? editSlots : EMPTY_APPOINTMENT_SLOTS}
              isEditing={isEditing}
              isLoading={isLoading}
              onChangeDate={changeDraftDate}
              onChangeStartsAt={setDraftStartsAt}
              onDelete={deleteBooking}
              onRetryAvailability={retryEditAvailability}
              onSave={saveBooking}
              onStartEditing={startEditing}
              onStopEditing={stopEditing}
              timezone={selectedTimezone}
            />
          })}
        </ul>
      </div>
    </div>
  )
}
