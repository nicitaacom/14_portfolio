"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import moment from "moment"

import { Input } from "@/components/Input"
import { dateKeyToCalendarDate, formatInstantInZone, calendarDateToDateKey } from "@/libs/appointmentSlots"
import { useScopedI18n } from "@/locales/client"
import { useAppointmentStore } from "@/store/useAppointmentStore"

const TimezoneOption = memo(function TimezoneOption({
  hasSpacing,
  isHighlighted,
  isSelected,
  onHover,
  onSelect,
  timezone,
}: {
  hasSpacing: boolean
  isHighlighted: boolean
  isSelected: boolean
  onHover: (timezone: string) => void
  onSelect: (timezone: string) => void
  timezone: string
}) {
  const handleMouseOver = useCallback(() => onHover(timezone), [onHover, timezone])
  const handleClick = useCallback(() => onSelect(timezone), [onSelect, timezone])

  return <button
    type="button"
    className={twMerge(
      "appointment-picker-option flex w-full items-center justify-between gap-xs rounded-[9px] px-sm py-xs text-left text-sm font-medium transition-all duration-200",
      hasSpacing && "mt-xs",
      isHighlighted
        ? "bg-steel text-secondary-foreground"
        : isSelected && "bg-cta/15 text-cta",
    )}
    onMouseOver={handleMouseOver}
    onClick={handleClick}>
    <span className="truncate text-secondary">{timezone}</span>
    <span
      className={twMerge(
        "shrink-0 rounded-[7px] border px-sm py-xs text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-200",
        isSelected
          ? "border-cta/60 bg-cta/20 text-cta"
          : "border-brass/40 bg-steel text-secondary-foreground/70 hover:border-cta/40",
      )}>
      UTC{moment.tz(timezone).format("Z")}
    </span>
  </button>
})

function useTimezoneDropdownHandlers({
  closeDropdown,
  selectedDate,
  selectedSlotStart,
  setHover,
  setSelectedDate,
  setSelectedTimezone,
}: {
  closeDropdown: () => void
  selectedDate: Date | null | [Date | null, Date | null]
  selectedSlotStart: string | null
  setHover: (timezone: string | null) => void
  setSelectedDate: (date: Date | null | [Date | null, Date | null]) => void
  setSelectedTimezone: (timezone: string) => void
}) {
  const mouseHover = useCallback((timezone: string) => setHover(timezone), [setHover])

  const changeSelectedTimezone = useCallback((timezone: string) => {
    setSelectedTimezone(timezone)
    if (selectedSlotStart) {
      const converted = formatInstantInZone(selectedSlotStart, timezone)
      if (converted) setSelectedDate(dateKeyToCalendarDate(converted.date))
    } else if (selectedDate instanceof Date) {
      setSelectedDate(dateKeyToCalendarDate(calendarDateToDateKey(selectedDate)))
    }
    closeDropdown()
  }, [closeDropdown, selectedDate, selectedSlotStart, setSelectedDate, setSelectedTimezone])

  return { changeSelectedTimezone, mouseHover }
}

export function DropdownContent({
  closeDropdown,
  isShowDropdown,
}: {
  closeDropdown: () => void
  isShowDropdown: boolean
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const { selectedTimezone, selectedSlotStart, selectedDate, setSelectedTimezone, setSelectedDate } = useAppointmentStore()
  const t = useScopedI18n("appointment.page")
  const isHover = hover !== null
  const { changeSelectedTimezone, mouseHover } = useTimezoneDropdownHandlers({
    closeDropdown, selectedDate, selectedSlotStart, setHover, setSelectedDate, setSelectedTimezone,
  })

  const filteredTimezones = useMemo(() => {
    const normalizedValue = searchInput.toLowerCase().trim()
    const timezones = moment.tz.names()
    const filtered = timezones.filter(
      timezone => timezone.length <= 22 && timezone.toLowerCase().includes(normalizedValue),
    )

    filtered.sort((a, b) => {
      const indexA = a.toLowerCase().indexOf(normalizedValue)
      const indexB = b.toLowerCase().indexOf(normalizedValue)
      return indexA - indexB
    })

    return filtered
  }, [searchInput])

  return (
    <div
      className={twMerge(
        "appointment-picker-menu absolute left-0 top-[calc(100%+6px)] w-full rounded-[12px] border border-brass/40 bg-steel-deep p-xs shadow-[0_18px_36px_rgba(0,0,0,0.34)]",
        isShowDropdown
          ? "visible translate-y-0 opacity-100 transition-all duration-200"
          : "invisible translate-y-[-8px] opacity-0 transition-all duration-200",
      )}
      onClick={event => event.stopPropagation()}
      onMouseLeave={() => setHover(null)}>
      <Input
        className="h-[38px] w-full rounded-[9px] border border-brass/40 bg-steel text-sm font-medium text-secondary placeholder:text-secondary-foreground/50 focus:border-cta/60 focus:ring-1 focus:ring-cta/30 transition-all duration-200"
        placeholder={t("searchTimezones")}
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onClick={e => e.stopPropagation()}
      />
      <div className="max-h-[196px] overflow-y-scroll hide-scrollbar pt-xs">
        {filteredTimezones.map((timezone, index) => <TimezoneOption
          key={timezone}
          hasSpacing={index > 0}
          isHighlighted={isHover && hover === timezone}
          isSelected={selectedTimezone === timezone}
          onHover={mouseHover}
          onSelect={changeSelectedTimezone}
          timezone={timezone}
        />)}
      </div>
    </div>
  )
}
