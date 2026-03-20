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
import { convertCurrentToTargetTimezone } from "@/(site)/functions/convertCurrentToTargetTimezone"
import { isDisabledFn } from "@/(site)/functions/isDisabledFn"
import { Bookings } from "./ScheduleAppointment"

export function TimePicker({ bookings }: Bookings) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)

  const { selectedTimezone } = useSelectedTimezoneStore()
  const { selectedDate } = useSelectedDateStore()
  const { selectedTime, setSelectedTime } = useSelectedTimeStore()
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
    return () => setSelectedTime(index)
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
    <div
      className="relative flex h-[40px] w-full min-w-[150px] items-center justify-between gap-xs rounded-[8px] border border-[#777777] bg-primary/70 px-sm cursor-pointer tablet:w-[160px]"
      onClick={() => setShowDropdown(!showDropdown)}
      ref={dropdownContainerRef}>
      <div className="flex items-center gap-xs">
        <BiTimeFive className="mb-[1px] text-secondary-foreground" />
        <span className="whitespace-nowrap text-sm text-secondary">Time: {selectedTime}</span>
      </div>
      <Image className="h-[16px] w-[16px]" src="/tringle.png" alt="tringle" width={16} height={16} />

      {/* Dropdown-content */}
      <div
        className={twMerge(
          `absolute left-0 right-0 top-[calc(100%+6px)] z-10 flex max-h-[240px] flex-col overflow-scroll rounded-[8px]
          border border-[#777777] bg-primary text-md text-center text-secondary hide-scrollbar`,
          showDropdown
            ? "opacity-100 visible translate-y-[0px] transition-all duration-300"
            : "opacity-0 invisible translate-y-[-20px] transition-all duration-300",
        )}
        onMouseLeave={() => setHover(null)}>
        {convertedTimePicker.map(time => {
          const targetDate = selectedDate && !Array.isArray(selectedDate) ? selectedDate : new Date()
          const isTimeDisabled =
            isDisabledFn(time.time, isDateBeforeTodayOrTime(targetDate) ? tomorrow : targetDate) || // disable time before now
            isBookedTime(time.time, targetDate) // disable booked time
          return (
            <button
              className={twMerge(
                `border-b border-solid border-secondary bg-primary py-[4px]`,
                isTimeDisabled
                  ? "text-secondary/20 bg-primary-foreground"
                  : isHover
                    ? hover === time.time && "bg-cta"
                    : selectedTime === time.time && "bg-cta",
              )}
              onMouseOver={isTimeDisabled ? undefined : mouseHover(time.time)}
              onClick={isTimeDisabled ? undefined : changeSelectedTime(time.time)}
              disabled={isTimeDisabled}
              key={time.time}>
              {time.time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
