"use client"

import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import moment from "moment"

import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { Input } from "@/components/Input"
import { useSelectedTimeStore } from "@/store/useSelectedTimeStore"
import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"
import { useScopedI18n } from "@/locales/client"

export function DropdownContent({
  closeDropdown,
  isShowDropdown,
}: {
  closeDropdown: () => void
  isShowDropdown: boolean
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const { selectedTimezone, setSelectedTimezone } = useSelectedTimezoneStore()
  const { setSelectedTime } = useSelectedTimeStore()
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
        "absolute left-0 top-[calc(100%+8px)] w-full rounded-[14px] border border-[#777777] bg-[#1b1b1b] p-[6px] shadow-[0_20px_44px_rgba(0,0,0,0.28)]",
        isShowDropdown
          ? "visible translate-y-0 opacity-100 transition-all duration-200"
          : "invisible translate-y-[-12px] opacity-0 transition-all duration-200",
      )}
      onClick={event => event.stopPropagation()}
      onMouseLeave={() => setHover(null)}>
      <Input
        className="w-full rounded-[10px] border-[#3f3f3f] bg-[#222222] text-sm text-secondary placeholder:text-secondary-foreground/70 focus:border-[#5e5e5e]"
        placeholder={t("searchTimezones")}
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onClick={e => e.stopPropagation()}
      />
      <div className="max-h-[240px] overflow-y-scroll hide-scrollbar pt-[6px]">
        {filteredTimezones.map((timezone, index) => (
          <button
            type="button"
            className={twMerge(
              "flex w-full items-center justify-between gap-sm rounded-[10px] px-md py-sm text-left text-sm transition-colors duration-150",
              index > 0 && "mt-[2px]",
              isHover ? hover === timezone && "bg-[#303030]" : selectedTimezone === timezone && "bg-[#303030]",
            )}
            onMouseOver={mouseHover(timezone)}
            onClick={() => changeSelectedTimezone(timezone)}
            key={timezone}>
            <span className="truncate text-secondary">{timezone}</span>
            <span
              className={twMerge(
                "shrink-0 rounded-full border px-[8px] py-[3px] text-[10px] uppercase tracking-[0.18em]",
                selectedTimezone === timezone
                  ? "border-cta/40 bg-cta/15 text-cta"
                  : "border-[#4a4a4a] bg-[#232323] text-secondary-foreground/70",
              )}>
              UTC{moment.tz(timezone).format("Z")}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
