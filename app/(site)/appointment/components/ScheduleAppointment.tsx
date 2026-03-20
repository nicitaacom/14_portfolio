"use client"

import { useEffect } from "react"
import { Calendar } from "react-calendar"
import { nanoid } from "nanoid"
import moment from "moment"

import { Button } from "@/components/Button"
import { TimePicker } from "./TimePicker"
import { useSelectedDateStore } from "@/store/useSelectedDateStore"
import { useModalsStore } from "@/store/modalsStore"
import { isDateBeforeTodayOrTime } from "@/utils/isDateBeforeTodayOrTime"
import { TimeZonePicker } from "./TimezonePicker/TimeZonePicker"
import { formatedDateTimeFn } from "@/(site)/functions/formatedDateTimeFn"
import { getCookie, setCookie } from "@/utils/helpersCSR"

export type Bookings = {
  bookings: {
    booking_date: string
    booking_time_MSK: string
  }[]
}

export function ScheduleAppointment({ bookings }: Bookings) {
  const { selectedDate, setSelectedDate } = useSelectedDateStore()
  const { openModal } = useModalsStore()

  const selectedDateValue =
    selectedDate instanceof Date ? selectedDate : Array.isArray(selectedDate) ? selectedDate[0] : null

  const selectedDateOnly = selectedDateValue ? moment(selectedDateValue).format("DD.MM.YYYY") : ""

  useEffect(() => {
    if (!getCookie("user_cookie_id")) {
      setCookie("user_cookie_id", nanoid())
    }
  }, [])

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[820px] rounded-[16px] border border-[#777777] bg-primary-foreground/30 p-md shadow-[0_24px_80px_rgba(0,0,0,0.2)] tablet:p-[1.5rem]">
        <div className="flex w-full min-w-0 flex-col gap-sm">
            <div className="flex flex-col gap-sm tablet:flex-row tablet:items-start tablet:justify-between">
              <div className="min-w-0 max-w-[14rem]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Book a call</p>
              </div>
              <TimeZonePicker />
            </div>

            <div className="min-w-0 overflow-hidden rounded-[16px] border border-[#777777] bg-primary/80">
              <div className="flex flex-col gap-sm border-b border-[#777777] px-sm py-sm tablet:flex-row tablet:items-start tablet:justify-between">
                <div className="min-w-0">
                  <h2 className="text-[1.15rem] font-bold leading-none text-secondary">Pick your day</h2>
                  <div className="mt-[6px] text-sm leading-relaxed text-secondary-foreground">
                    <span className="tablet:hidden">{selectedDateOnly}</span>
                    <span className="hidden tablet:inline">{formatedDateTimeFn().trim()}</span>
                  </div>
                </div>
                <TimePicker bookings={bookings} />
              </div>

              <div className="min-w-0 px-xs pb-xs pt-xs tablet:px-sm tablet:pb-sm">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={({ date }) => (isDateBeforeTodayOrTime(date) ? "opacity-50 hover:bg-transparent" : "")}
                  tileDisabled={({ date }) => isDateBeforeTodayOrTime(date)}
                />
              </div>
            </div>

            <Button
              className="w-full rounded-[8px] border-cta bg-cta px-md py-sm text-base font-bold text-primary hover:bg-cta/85 laptop:w-fit laptop:self-end"
              onClick={() => openModal("Appointment")}>
              Continue to booking
            </Button>
        </div>
      </div>
    </div>
  )
}
