"use client"

import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import moment from "moment"

import { Input } from "@/components/Input"
import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"
import { useScopedI18n } from "@/locales/client"
import { useAppointmentStore } from "@/store/useAppointmentStore"

export function DropdownContent({
  closeDropdown,
  isShowDropdown,
}: {
  closeDropdown: () => void
  isShowDropdown: boolean
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const { selectedTimezone, setSelectedTimezone, setSelectedTime } = useAppointmentStore()
  const t = useScopedI18n("appointment.page")
  const isHover = hover !== null

  function mouseHover(index: string) {
    return () => setHover(index)
  }

  function changeSelectedTimezone(index: string) {
    const mskTime = moment.tz(appointmentTimesMSK[0].time, "HH:mm", "Europe/Moscow")
    const convertedTime = mskTime.clone().tz(index).format("HH:mm")

    setSelectedTime(convertedTime)
    setSelectedTimezone(index)
    closeDropdown()
  }

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
        {filteredTimezones.map((timezone, index) => (
          <button
            type="button"
            className={twMerge(
              "appointment-picker-option flex w-full items-center justify-between gap-xs rounded-[9px] px-sm py-xs text-left text-sm font-medium transition-all duration-200",
              index > 0 && "mt-[2px]",
              isHover
                ? hover === timezone && "bg-steel text-secondary-foreground"
                : selectedTimezone === timezone && "bg-cta/15 text-cta",
            )}
            onMouseOver={mouseHover(timezone)}
            onClick={() => changeSelectedTimezone(timezone)}
            key={timezone}>
            <span className="truncate text-secondary">{timezone}</span>
            <span
              className={twMerge(
                "shrink-0 rounded-[7px] border px-[8px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-200",
                selectedTimezone === timezone
                  ? "border-cta/60 bg-cta/20 text-cta"
                  : "border-brass/40 bg-steel text-secondary-foreground/70 hover:border-cta/40",
              )}>
              UTC{moment.tz(timezone).format("Z")}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
