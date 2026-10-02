"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Calendar } from "react-calendar"
import { nanoid } from "nanoid"
import moment from "moment-timezone"

import { Button } from "@/components/Button"
import { useModalsStore } from "@/store/useModalsStore"
import { TimeZonePicker } from "./TimezonePicker/TimeZonePicker"
import { getCookie, setCookie } from "@/utils/helpersCSR"
import { useScopedI18n } from "@/locales/client"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { calendarDateToDateKey, dateKeyToCalendarDate, formatInstantInZone } from "@/libs/appointmentSlots"
import { getCurrentAppointmentSlots, refreshAppointmentAvailability } from "../hooks/appointmentAvailabilityClient"
import { TimePicker } from "./TimePicker"
import useToast from "@/store/useToast"

export function ScheduleAppointment() {
  const [nowTick, setNowTick] = useState(Date.now())
  const lastFocusRefresh = useRef(0)
  const { selectedDate, setSelectedDate, selectedTimezone, setSelectedTimezone, selectedSlotStart, setSelectedSlotStart,
    availabilityLoading, availabilityError, availabilityDate, availabilityTimezone, availabilitySlots,
    availabilityServerNow, availabilityReceivedAt, availabilityNoticeCode, setAvailabilityNoticeCode, setStep } = useAppointmentStore()
  const { openModal } = useModalsStore()
  const t = useScopedI18n("appointment.page")
  const availabilityT = useScopedI18n("appointment.availability")
  const toastT = useScopedI18n("toast")
  const toast = useToast()

  const selectedDateValue = selectedDate instanceof Date ? selectedDate : Array.isArray(selectedDate) ? selectedDate[0] : null
  const displayDayKey = selectedDateValue ? calendarDateToDateKey(selectedDateValue) : formatInstantInZone(new Date().toISOString(), selectedTimezone)?.date ?? ""
  const todayInSelectedZone = formatInstantInZone(new Date(nowTick).toISOString(), selectedTimezone)?.date ?? displayDayKey
  const slots = useMemo(() => getCurrentAppointmentSlots(nowTick, {
    availabilityError, availabilityLoading, availabilityDate, availabilityTimezone,
    availabilitySlots, availabilityServerNow, availabilityReceivedAt,
  }), [nowTick, availabilityError, availabilityLoading, availabilityDate, availabilityTimezone,
    availabilitySlots, availabilityServerNow, availabilityReceivedAt])
  const selectedDisplay = selectedSlotStart ? formatInstantInZone(selectedSlotStart, selectedTimezone) : null

  const refresh = useCallback((replaceInvalid = true) => {
    if (!displayDayKey) return Promise.resolve(null)
    return refreshAppointmentAvailability(displayDayKey, selectedTimezone, replaceInvalid)
  }, [displayDayKey, selectedTimezone])

  useEffect(() => {
    if (selectedTimezone === "Europe/Moscow") setSelectedTimezone(moment.tz.guess())
    if (!selectedDateValue) {
      const timezone = moment.tz.guess()
      setSelectedDate(dateKeyToCalendarDate(formatInstantInZone(new Date().toISOString(), timezone)?.date ?? moment().format("YYYY-MM-DD")))
    }
    // The first client render chooses the browser's display zone and a day label in that zone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (displayDayKey) refreshAppointmentAvailability(displayDayKey, selectedTimezone).catch(() => undefined)
  }, [displayDayKey, selectedTimezone])

  useEffect(() => {
    const recalculate = () => setNowTick(Date.now())
    const refreshOnFocus = () => {
      if (document.visibilityState !== "visible") return
      recalculate()
      if (Date.now() - lastFocusRefresh.current < 5000) return
      lastFocusRefresh.current = Date.now()
      refreshAppointmentAvailability(displayDayKey, selectedTimezone).catch(() => undefined)
    }
    const interval = window.setInterval(recalculate, 30_000)
    window.addEventListener("focus", refreshOnFocus)
    document.addEventListener("visibilitychange", refreshOnFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", refreshOnFocus)
      document.removeEventListener("visibilitychange", refreshOnFocus)
    }
  }, [displayDayKey, selectedTimezone])

  useEffect(() => {
    if (!availabilityNoticeCode) return
    const messages: Record<API.SlotFailureCode, string> = {
      SLOT_IN_PAST: availabilityT("SLOT_IN_PAST"), SLOT_TOO_SOON: availabilityT("SLOT_TOO_SOON"),
      SLOT_BLOCKED: availabilityT("SLOT_BLOCKED"), SLOT_BOOKED: availabilityT("SLOT_BOOKED"),
      SLOT_UNAVAILABLE: availabilityT("SLOT_UNAVAILABLE"), INVALID_SLOT: availabilityT("INVALID_SLOT"),
      SELECTION_REFRESH_REQUIRED: availabilityT("SELECTION_REFRESH_REQUIRED"), AVAILABILITY_UNAVAILABLE: availabilityT("AVAILABILITY_UNAVAILABLE"),
    }
    toast.show("warning", toastT("defaultWarningTitle"), messages[availabilityNoticeCode])
    setAvailabilityNoticeCode(null)
  }, [availabilityNoticeCode, availabilityT, setAvailabilityNoticeCode, toast, toastT])

  useEffect(() => {
    if (availabilityLoading || availabilityError || !selectedSlotStart) return
    const current = slots.find(slot => slot.startsAt === selectedSlotStart)
    if (current?.status === "available") return
    const modalIsOpen = useModalsStore.getState().isOpen.Appointment
    if (modalIsOpen) {
      useAppointmentStore.getState().setSelectionInvalid(true)
      return
    }
    const failureCode = current?.status === "past" ? "SLOT_IN_PAST"
      : current?.status === "too_soon" ? "SLOT_TOO_SOON"
        : current?.status === "blocked" ? "SLOT_BLOCKED"
          : current?.status === "booked" ? "SLOT_BOOKED" : "SLOT_UNAVAILABLE"
    const replacement = slots.find(slot => slot.status === "available")
    setAvailabilityNoticeCode(failureCode)
    setSelectedSlotStart(replacement?.startsAt ?? null)
  }, [availabilityLoading, availabilityError, nowTick, selectedSlotStart, setAvailabilityNoticeCode, setSelectedSlotStart, slots])

  useEffect(() => {
    if (!getCookie("user_cookie_id")) setCookie("user_cookie_id", nanoid())
  }, [])

  function changeCalendarDay(value: Date | null) {
    if (!value) return
    const key = calendarDateToDateKey(value)
    setSelectedDate(dateKeyToCalendarDate(key))
    setSelectedSlotStart(null)
    useAppointmentStore.getState().setSelectionInvalid(false)
    setAvailabilityNoticeCode(null)
  }

  async function continueToBooking() {
    const previousSelection = useAppointmentStore.getState().selectedSlotStart
    let result
    try { result = await refresh(true) } catch {
      toast.show("error", toastT("defaultErrorTitle"), availabilityT("AVAILABILITY_UNAVAILABLE"))
      return
    }
    const currentState = useAppointmentStore.getState()
    const refreshedSelection = currentState.selectedSlotStart
    const selectedSlot = result?.slots.find(slot => slot.startsAt === refreshedSelection)
    if (!previousSelection || !result || result.invalidCode || result.selectionChanged || selectedSlot?.status !== "available") {
      if (!result && !currentState.availabilityError) toast.show("error", toastT("defaultErrorTitle"), availabilityT("AVAILABILITY_UNAVAILABLE"))
      return
    }
    setStep("step-1")
    openModal("Appointment")
  }

  const canContinue = !availabilityLoading && !availabilityError && Boolean(selectedSlotStart && slots.some(slot => slot.startsAt === selectedSlotStart && slot.status === "available"))

  return (
    <div className="appointment-calendar-board workbench-board w-full p-sm">
      <div className="appointment-schedule-panel machine-panel mx-auto w-full max-w-[680px] p-sm tablet:p-md">
        <div className="flex w-full min-w-0 flex-col gap-sm">
          <div className="grid gap-sm min-[900px]:grid-cols-[minmax(0,1fr)_220px] min-[900px]:items-start">
            <div className="appointment-calendar-heading min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary/75">{t("bookACall")}</p>
              <div className="mt-xs flex flex-wrap items-baseline gap-x-sm gap-y-[2px]">
                <h2 className="text-[1.35rem] font-bold leading-tight text-secondary">{t("pickYourDay")}</h2>
                <span className="text-sm text-secondary-foreground/80">
                  <span className="tablet:hidden">{selectedDisplay?.date ?? displayDayKey}</span>
                  <span className="hidden tablet:inline">{selectedDisplay ? `${selectedDisplay.date} at ${selectedDisplay.time} ${selectedTimezone}` : displayDayKey}</span>
                </span>
              </div>
              <p className="mt-xs max-w-[32rem] text-sm leading-relaxed text-secondary-foreground/75">{t("dailyLimit", { count: 2 })}</p>
            </div>

            <div className="appointment-picker-group grid w-full grid-cols-1 gap-xs min-[520px]:grid-cols-2 min-[900px]:flex min-[900px]:flex-col">
              <TimeZonePicker />
              <TimePicker
                slots={slots}
                isLoading={availabilityLoading}
                hasError={availabilityError}
                onOpen={() => { refresh().catch(() => undefined) }}
                onRetry={() => { refresh().catch(() => undefined) }}
              />
            </div>
          </div>

          <div className="appointment-calendar-shell machine-bezel min-w-0 overflow-hidden px-xs pb-xs">
            <Calendar
              onChange={value => { if (value instanceof Date) changeCalendarDay(value) }}
              value={selectedDateValue ?? dateKeyToCalendarDate(displayDayKey)}
              tileClassName={({ date }) => calendarDateToDateKey(date) < todayInSelectedZone ? "opacity-40 hover:bg-transparent cursor-not-allowed" : ""}
              tileDisabled={({ date }) => calendarDateToDateKey(date) < todayInSelectedZone}
            />
          </div>

          {availabilityError && <p className="text-sm text-danger" role="alert">{t("availabilityFailed")}</p>}
          {!availabilityLoading && !availabilityError && slots.every(slot => slot.status !== "available") && (
            <p className="text-sm text-secondary-foreground" role="status">{t("noSlotsForDay")}</p>
          )}
          <Button
            className="appointment-primary-action h-[40px] w-full px-md py-0 text-sm font-bold text-secondary tablet:w-fit tablet:self-end"
            onClick={() => { continueToBooking() }}
            isDisabled={!canContinue}
            requestPending={availabilityLoading}>
            {t("continueToBooking")}
          </Button>
        </div>
      </div>
    </div>
  )
}
