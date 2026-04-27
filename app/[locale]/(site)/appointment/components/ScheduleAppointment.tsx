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
import { formatedDateTimeFn } from "../../functions/formatedDateTimeFn"
import { getCookie, setCookie } from "@/utils/helpersCSR"
import { useScopedI18n } from "@/locales/client"

export type Bookings = {
  bookings: {
    booking_date: string
    booking_time_MSK: string
  }[]
}

export function ScheduleAppointment({ bookings }: Bookings) {
  const { selectedDate, setSelectedDate } = useSelectedDateStore()
  const { openModal } = useModalsStore()
  const t = useScopedI18n("appointment.page")

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
      <div className="mx-auto w-full max-w-[820px] rounded-[20px] border border-[#777777] bg-[linear-gradient(180deg,rgba(45,45,45,0.92),rgba(28,28,28,0.9))] p-md shadow-[0_28px_90px_rgba(0,0,0,0.24)] tablet:p-[1.5rem]">
        <div className="flex w-full min-w-0 flex-col gap-md">
          <div className="flex flex-col gap-md rounded-[18px] border border-[#777777] bg-[#232323]/75 p-sm tablet:p-md">
            <div className="flex flex-col gap-md tablet:flex-row tablet:items-start tablet:justify-between">
              <div className="min-w-0 max-w-[28rem]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{t("bookACall")}</p>
                <h2 className="mt-[10px] text-[1.6rem] font-bold leading-tight text-secondary">{t("pickYourDay")}</h2>
                <div className="mt-[8px] text-sm leading-relaxed text-secondary-foreground">
                  <span className="tablet:hidden">{selectedDateOnly}</span>
                  <span className="hidden tablet:inline">{formatedDateTimeFn().trim()}</span>
                </div>
                <p className="mt-[12px] max-w-[36rem] text-sm leading-relaxed text-secondary-foreground/90">
                  {t("dailyLimit", { count: 2 })}
                </p>
              </div>

              <div className="flex w-full flex-col gap-sm tablet:max-w-[240px]">
                <TimeZonePicker />
                <TimePicker bookings={bookings} />
              </div>
            </div>
            <div className="min-w-0 overflow-hidden rounded-[16px] border border-[#777777] bg-primary/80">
              <div className="min-w-0 px-xs pb-xs pt-xs tablet:px-sm tablet:pb-sm">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={({ date }) => (isDateBeforeTodayOrTime(date) ? "opacity-50 hover:bg-transparent" : "")}
                  tileDisabled={({ date }) => isDateBeforeTodayOrTime(date)}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full rounded-[12px] border-cta bg-cta px-md py-sm text-base font-bold text-primary shadow-[0_18px_40px_rgba(168,85,247,0.22)] hover:bg-cta/85 laptop:w-fit laptop:self-end"
            onClick={() => openModal("Appointment")}>
            {t("continueToBooking")}
          </Button>
        </div>
      </div>
    </div>
  )
}
