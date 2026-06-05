"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { BiTimeFive } from "react-icons/bi"
import { twMerge } from "tailwind-merge"
import moment from "moment"

import { useCloseOnClickEsc } from "@/hooks/useOnClickEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { useSelectedTimeStore } from "@/store/useSelectedTimeStore"
import { useSelectedDateStore } from "@/store/useSelectedDateStore"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"
import { isDateBeforeTodayOrTime } from "@/utils/isDateBeforeTodayOrTime"
import { convertCurrentToTargetTimezone } from "../../functions/convertCurrentToTargetTimezone"
import { isDisabledFn } from "../../functions/isDisabledFn"
import { useScopedI18n } from "@/locales/client"

export function TimePicker() {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)

  const { selectedTimezone } = useSelectedTimezoneStore()
  const { selectedDate } = useSelectedDateStore()
  const { selectedTime, setSelectedTime } = useSelectedTimeStore()
  const t = useScopedI18n("appointment.page")
  const [showDropdown, setShowDropdown] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [takenSlotsMSK, setTakenSlotsMSK] = useState<string[]>([])

  const isHover = hover !== null

  useCloseOnClickEsc(() => setShowDropdown(false))
  useCloseOnClickOutside(dropdownContainerRef, () => setShowDropdown(false))

  const now = moment.tz("Europe/Moscow") // Get current time in MSK timezone
  const startWindow = moment.tz("12:00", "HH:mm", "Europe/Moscow") // 12:00 MSK
  const endWindow = moment.tz("22:00", "HH:mm", "Europe/Moscow") // 22:00 MSK
  const tomorrow = moment().add(1, "day").toDate()

  // Check if the current time is outside the time window
  const disableAllToday = now.isBefore(startWindow) || now.isSameOrAfter(endWindow)

  // if time outside the time window, set to first time window (12:00 MSK)
  useEffect(() => {
    if (disableAllToday) setSelectedTime("12:00")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableAllToday, selectedTimezone])

  useEffect(() => {
    const targetDate =
      selectedDate && !Array.isArray(selectedDate) ? selectedDate : new Date()
    const dateKey = moment(targetDate).format("YYYY-MM-DD")

    fetch(`/api/bookings/taken-slots?date=${dateKey}`)
      .then(r => r.json())
      .then(data => {
        const slots: string[] = data.slots ?? []
        setTakenSlotsMSK(slots)

        // If the currently selected time is taken, advance to the next free slot
        const currentTimeMSK = convertCurrentToTargetTimezone(selectedTime, selectedTimezone, "Europe/Moscow")
        if (slots.includes(currentTimeMSK)) {
          const nextFree = convertedTimePicker.find(t => {
            const tMSK = convertCurrentToTargetTimezone(t.time, selectedTimezone, "Europe/Moscow")
            return !slots.includes(tMSK) && !isDisabledFn(t.time, targetDate)
          })
          if (nextFree) setSelectedTime(nextFree.time)
        }
      })
      .catch(() => setTakenSlotsMSK([]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  function mouseHover(index: string) {
    return () => setHover(index)
  }

  function changeSelectedTime(index: string) {
    return () => {
      setSelectedTime(index)
      setShowDropdown(false)
    }
  }

  const convertedTimePicker = appointmentTimesMSK.map(time => ({
    ...time,
    time: convertCurrentToTargetTimezone(time.time, "Europe/Moscow", selectedTimezone),
  }))

  function isBookedTime(time: string): boolean {
    const timeMSK = convertCurrentToTargetTimezone(time, selectedTimezone, "Europe/Moscow")
    return takenSlotsMSK.includes(timeMSK)
  }

  return (
    <div className="relative w-full" ref={dropdownContainerRef}>
      <button
        type="button"
        className={twMerge(
          "flex h-[40px] w-full items-center justify-between gap-xs rounded-[10px] border border-[#555555] bg-[#242424] px-sm text-left transition-colors duration-200",
          showDropdown && "border-cta/60 bg-[#28222e]",
        )}
        onClick={() => setShowDropdown(!showDropdown)}>
        <div className="flex min-w-0 items-center gap-xs">
          <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[7px] border border-[#555555] bg-[#1d1d1d]">
            <BiTimeFive className="text-cta" size={15} />
          </span>
          <span className="truncate text-sm font-medium text-secondary">{t("timeLabel", { time: selectedTime })}</span>
        </div>
        <Image
          className={twMerge(
            "h-[14px] w-[14px] shrink-0 transition-transform duration-200",
            showDropdown && "rotate-180",
          )}
          src="/tringle.png"
          alt="Dropdown arrow"
          width={18}
          height={18}
        />
      </button>

      <div
        className={twMerge(
          "absolute left-0 top-[calc(100%+6px)] z-20 w-full rounded-[12px] border border-[#555555] bg-[#181818] p-xs shadow-[0_18px_36px_rgba(0,0,0,0.34)]",
          showDropdown
            ? "visible translate-y-0 opacity-100 transition-all duration-200"
            : "invisible translate-y-[-8px] opacity-0 transition-all duration-200",
        )}
        onClick={event => event.stopPropagation()}
        onMouseLeave={() => setHover(null)}>
        <div className="max-h-[196px] overflow-y-scroll hide-scrollbar">
          {convertedTimePicker.map(time => {
            const targetDate = selectedDate && !Array.isArray(selectedDate) ? selectedDate : new Date()
            const isPast = isDisabledFn(time.time, isDateBeforeTodayOrTime(targetDate) ? tomorrow : targetDate)
            const isBooked = isBookedTime(time.time)
            const isTimeDisabled = isPast || isBooked
            const isActive = isHover ? hover === time.time : selectedTime === time.time

            return (
              <button
                type="button"
                className={twMerge(
                  "flex w-full items-center justify-between rounded-[11px] px-md py-sm text-left text-sm font-medium transition-all duration-200",
                  time.time !== convertedTimePicker[0].time && "mt-[2px]",
                  isTimeDisabled
                    ? "cursor-not-allowed bg-[#1f1f1f] text-secondary/30"
                    : isActive
                      ? "bg-cta/80 text-primary"
                      : "text-secondary hover:bg-[#262626] hover:text-secondary-foreground",
                )}
                onMouseOver={isTimeDisabled ? undefined : mouseHover(time.time)}
                onClick={isTimeDisabled ? undefined : changeSelectedTime(time.time)}
                disabled={isTimeDisabled}
                key={time.time}>
                <span>{time.time}</span>
                {isBooked ? (
                  <span className="rounded-[4px] border border-danger/30 bg-danger/10 px-[6px] py-[2px] text-xs text-danger/70">
                    {t("slotBooked")}
                  </span>
                ) : (
                  <span
                    className={twMerge(
                      "h-[10px] w-[10px] shrink-0 rounded-full transition-all duration-200",
                      isPast ? "bg-secondary-foreground/20" : isActive ? "bg-primary" : "bg-cta/60",
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
