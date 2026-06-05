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

export function ScheduleAppointment() {
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
      <div className="mx-auto w-full max-w-[680px] rounded-[16px] border border-[#555555] bg-[#202020] p-sm shadow-[0_18px_54px_rgba(0,0,0,0.24)] tablet:p-md">
        <div className="flex w-full min-w-0 flex-col gap-sm">
          <div className="grid gap-sm min-[900px]:grid-cols-[minmax(0,1fr)_220px] min-[900px]:items-start">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary/75">{t("bookACall")}</p>
              <div className="mt-xs flex flex-wrap items-baseline gap-x-sm gap-y-[2px]">
                <h2 className="text-[1.35rem] font-bold leading-tight text-secondary">{t("pickYourDay")}</h2>
                <span className="text-sm text-secondary-foreground/80">
                  <span className="tablet:hidden">{selectedDateOnly}</span>
                  <span className="hidden tablet:inline">{formatedDateTimeFn().trim()}</span>
                </span>
              </div>
              <p className="mt-xs max-w-[32rem] text-sm leading-relaxed text-secondary-foreground/75">
                {t("dailyLimit", { count: 2 })}
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-xs min-[520px]:grid-cols-2 min-[900px]:flex min-[900px]:flex-col">
              <TimeZonePicker />
              <TimePicker />
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#4c4c4c] bg-[#1c1c1c] px-xs pb-xs">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date }) =>
                isDateBeforeTodayOrTime(date) ? "opacity-40 hover:bg-transparent cursor-not-allowed" : ""
              }
              tileDisabled={({ date }) => isDateBeforeTodayOrTime(date)}
            />
          </div>

          <Button
            className="h-[40px] w-full rounded-[10px] border border-cta/40 bg-cta px-md py-0 text-sm font-bold text-primary shadow-[0_10px_28px_rgba(168,85,247,0.18)] transition-colors duration-200 hover:bg-cta/90 tablet:w-fit tablet:self-end"
            onClick={() => openModal("Appointment")}>
            {t("continueToBooking")}
          </Button>
        </div>
      </div>
    </div>
  )
}
