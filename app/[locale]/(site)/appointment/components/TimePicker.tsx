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
import { Bookings } from "./ScheduleAppointment"
import { useScopedI18n } from "@/locales/client"

export function TimePicker({ bookings }: Bookings) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)

  const { selectedTimezone } = useSelectedTimezoneStore()
  const { selectedDate } = useSelectedDateStore()
  const { selectedTime, setSelectedTime } = useSelectedTimeStore()
  const t = useScopedI18n("appointment.page")
  const [showDropdown, setShowDropdown] = useState(false)
  const [hover, setHover] = useState<string | null>(null)

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

  function isBookedTime(time: string, targetDate: Date): boolean {
    const date = moment(targetDate).format("YYYY-MM-DD")
    const timeMSK = convertCurrentToTargetTimezone(time, selectedTimezone, "Europe/Moscow")

    return bookings.some(booking => {
      const bookingDate = moment(booking.booking_date).format("YYYY-MM-DD")
      return bookingDate === date && booking.booking_time_MSK === timeMSK
    })
  }

  return (
    <div className="relative w-full" ref={dropdownContainerRef}>
      <button
        type="button"
        className={twMerge(
          "flex h-[46px] w-full items-center justify-between gap-sm rounded-[12px] border border-[#777777] bg-[#202020]/90 px-md text-left shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors duration-200",
          showDropdown && "border-cta/70 bg-[#262626]",
        )}
        onClick={() => setShowDropdown(!showDropdown)}>
        <div className="flex min-w-0 items-center gap-xs">
          <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[#5a5a5a] bg-[#2b2b2b]">
            <BiTimeFive className="text-secondary-foreground" />
          </span>
          <span className="truncate text-sm text-secondary">{t("timeLabel", { time: selectedTime })}</span>
        </div>
        <Image
          className={twMerge(
            "h-[16px] w-[16px] shrink-0 transition-transform duration-200",
            showDropdown && "rotate-180",
          )}
          src="/tringle.png"
          alt="Dropdown arrow"
          width={16}
          height={16}
        />
      </button>

      <div
        className={twMerge(
          "absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-[14px] border border-[#777777] bg-[#1b1b1b] p-[6px] shadow-[0_20px_44px_rgba(0,0,0,0.28)]",
          showDropdown
            ? "visible translate-y-0 opacity-100 transition-all duration-200"
            : "invisible translate-y-[-12px] opacity-0 transition-all duration-200",
        )}
        onClick={event => event.stopPropagation()}
        onMouseLeave={() => setHover(null)}>
        <div className="max-h-[240px] overflow-y-scroll hide-scrollbar">
          {convertedTimePicker.map(time => {
            const targetDate = selectedDate && !Array.isArray(selectedDate) ? selectedDate : new Date()
            const isTimeDisabled =
              isDisabledFn(time.time, isDateBeforeTodayOrTime(targetDate) ? tomorrow : targetDate) ||
              isBookedTime(time.time, targetDate)
            const isActive = isHover ? hover === time.time : selectedTime === time.time

            return (
              <button
                type="button"
                className={twMerge(
                  "flex w-full items-center justify-between rounded-[10px] px-md py-sm text-left text-sm transition-colors duration-150",
                  time.time !== convertedTimePicker[0].time && "mt-[2px]",
                  isTimeDisabled
                    ? "cursor-not-allowed bg-[#222222] text-secondary/25"
                    : isActive
                      ? "bg-cta/85 text-primary"
                      : "text-secondary hover:bg-[#2a2a2a]",
                )}
                onMouseOver={isTimeDisabled ? undefined : mouseHover(time.time)}
                onClick={isTimeDisabled ? undefined : changeSelectedTime(time.time)}
                disabled={isTimeDisabled}
                key={time.time}>
                <span>{time.time}</span>
                <span
                  className={twMerge(
                    "h-[8px] w-[8px] shrink-0 rounded-full",
                    isTimeDisabled ? "bg-secondary-foreground/25" : isActive ? "bg-primary/70" : "bg-cta/70",
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
