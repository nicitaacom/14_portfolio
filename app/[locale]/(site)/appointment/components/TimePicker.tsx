"use client"

import Image from "next/image"
import { memo, useCallback, useRef, useState } from "react"
import { BiTimeFive } from "react-icons/bi"
import { twMerge } from "tailwind-merge"

import { useCloseOnEsc } from "@/hooks/useCloseOnEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { formatInstantInZone, dateKeyToCalendarDate, type AppointmentSlot } from "@/libs/appointmentSlots"
import { useScopedI18n } from "@/locales/client"
import { useAppointmentStore } from "@/store/useAppointmentStore"

interface TimePickerProps {
  slots: AppointmentSlot[]
  isLoading: boolean
  hasError: boolean
  onOpen: () => void
  onRetry: () => void
}

const TimePickerOption = memo(function TimePickerOption({
  date,
  disabled,
  hasSpacing,
  isSelected,
  label,
  onSelect,
  startsAt,
  time,
}: {
  date: string
  disabled: boolean
  hasSpacing: boolean
  isSelected: boolean
  label: string
  onSelect: (startsAt: string) => void
  startsAt: string
  time: string
}) {
  const handleClick = useCallback(() => onSelect(startsAt), [onSelect, startsAt])

  return <button
    type="button"
    role="option"
    aria-selected={isSelected}
    aria-disabled={disabled}
    className={twMerge(
      "appointment-picker-option flex min-h-11 w-full items-center justify-between gap-xs rounded-[11px] px-md py-sm text-left text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed",
      hasSpacing && "mt-xs",
      disabled ? "bg-steel-deep text-secondary/45" : isSelected ? "bg-cta/80 text-primary" : "text-secondary hover:bg-steel hover:text-secondary-foreground",
    )}
    onClick={handleClick}
    disabled={disabled}>
    <span>{time}<small className="ml-xs text-[10px] opacity-70">{date}</small></span>
    <span className="text-[10px] uppercase tracking-wide">{label}</span>
  </button>
})

function useTimePickerHandlers({
  selectedTimezone,
  setSelectedDate,
  setSelectedSlotStart,
  setShowDropdown,
}: {
  selectedTimezone: string
  setSelectedDate: (date: Date) => void
  setSelectedSlotStart: (startsAt: string) => void
  setShowDropdown: (show: boolean) => void
}) {
  const selectSlot = useCallback((startsAt: string) => {
    setSelectedSlotStart(startsAt)
    const display = formatInstantInZone(startsAt, selectedTimezone)
    if (display) setSelectedDate(dateKeyToCalendarDate(display.date))
    setShowDropdown(false)
  }, [selectedTimezone, setSelectedDate, setSelectedSlotStart, setShowDropdown])

  return { selectSlot }
}

export function TimePicker({ slots, isLoading, hasError, onOpen, onRetry }: TimePickerProps) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const { selectedTimezone, selectedSlotStart, setSelectedSlotStart, setSelectedDate } = useAppointmentStore()
  const t = useScopedI18n("appointment.page")
  const [showDropdown, setShowDropdown] = useState(false)

  useCloseOnEsc(() => setShowDropdown(false))
  useCloseOnClickOutside(dropdownContainerRef, () => setShowDropdown(false))

  function toggleDropdown() {
    const next = !showDropdown
    setShowDropdown(next)
    if (next) onOpen()
  }

  const { selectSlot } = useTimePickerHandlers({ selectedTimezone, setSelectedDate, setSelectedSlotStart, setShowDropdown })

  const selectedDisplay = selectedSlotStart ? formatInstantInZone(selectedSlotStart, selectedTimezone) : null
  const selectedTimeLabel = selectedDisplay ? `${selectedDisplay.date} · ${selectedDisplay.time}` : t("selectTime")

  return (
    <div className="relative w-full" ref={dropdownContainerRef}>
      <button
        type="button"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        className={twMerge(
          "appointment-picker-trigger flex h-[40px] w-full items-center justify-between gap-xs rounded-[10px] border border-brass/40 bg-steel px-sm text-left transition-colors duration-200",
          showDropdown && "border-cta/60 bg-cta/15",
        )}
        onClick={toggleDropdown}>
        <div className="flex min-w-0 items-center gap-xs">
          <span className="appointment-picker-icon flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[7px] border border-brass/40 bg-steel-deep">
            <BiTimeFive className="text-cta" size={15} />
          </span>
          <span className="truncate text-sm font-medium text-secondary">{t("timeLabel", { time: selectedTimeLabel })}</span>
        </div>
        <Image className={twMerge("h-[14px] w-[14px] shrink-0 transition-transform duration-200", showDropdown && "rotate-180")} src="/tringle.png" alt="" width={18} height={18} />
      </button>

      <div
        className={twMerge(
          "appointment-picker-menu absolute left-0 top-[calc(100%+6px)] z-20 w-full rounded-[12px] border border-brass/40 bg-steel-deep p-xs shadow-[0_18px_36px_rgba(0,0,0,0.34)]",
          showDropdown ? "visible translate-y-0 opacity-100 transition-all duration-200" : "invisible translate-y-[-8px] opacity-0 transition-all duration-200",
        )}
        onClick={event => event.stopPropagation()}>
        {hasError ? (
          <div className="px-sm py-md text-sm text-secondary-foreground" role="alert">
            <p>{t("availabilityFailed")}</p>
            <button className="mt-xs min-h-10 underline underline-offset-2" type="button" onClick={onRetry}>{t("retryAvailability")}</button>
          </div>
        ) : isLoading ? (
          <p className="px-sm py-md text-sm text-secondary-foreground" role="status">{t("loadingAvailability")}</p>
        ) : slots.length === 0 ? (
          <p className="px-sm py-md text-sm text-secondary-foreground">{t("noSlotsForDay")}</p>
        ) : (
          <div className="max-h-[min(55vh,360px)] overflow-y-auto hide-scrollbar" role="listbox" aria-label={t("availableTimes")}>
            {slots.map((slot, index) => {
              const display = formatInstantInZone(slot.startsAt, selectedTimezone)
              if (!display) return null
              const labels = {
                available: t("slotAvailable"),
                booked: t("slotBooked"),
                blocked: t("slotBlocked"),
                too_soon: t("slotTooSoon"),
                past: t("slotPast"),
              }
              const disabled = slot.status !== "available"
              return <TimePickerOption
                key={slot.startsAt}
                date={display.date}
                disabled={disabled}
                hasSpacing={index > 0}
                isSelected={selectedSlotStart === slot.startsAt}
                label={labels[slot.status]}
                onSelect={selectSlot}
                startsAt={slot.startsAt}
                time={display.time}
              />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
