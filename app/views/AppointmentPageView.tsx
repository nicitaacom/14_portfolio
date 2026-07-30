import moment from "moment"
import { cookies } from "next/headers"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { NewYearFilmStrip } from "@/components/NewYear/NewYearFilmStrip"
import { ScheduleAppointment } from "../[locale]/(site)/appointment/components/ScheduleAppointment"
import { ScheduleAppointmentModal } from "@/components/Modals/ScheduleAppointment/ScheduleAppointmentModal"
import { ToastWrapper } from "../[locale]/(site)/appointment/components/ToastWrapper"
import { BookedAppointments } from "../[locale]/(site)/appointment/components/BookedAppointments"
import { IsGMLive } from "../[locale]/(site)/appointment/components/IsGMLive"

export async function AppointmentPageView() {
  const today = moment().format("YYYY-MM-DD")
  const userCookieId = (await cookies()).get("user_cookie_id")?.value
  const { data: bookedAppointments } = userCookieId
    ? await supabaseAdmin.from("bookings").select().gte("booking_date", today).eq("user_cookie_id", userCookieId)
    : { data: [] }

  return (
    <div className="appointment-rack flex w-full justify-center overflow-x-hidden px-sm tablet:px-md">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-sm laptop:max-w-[920px]">
        <IsGMLive />
        <NewYearFilmStrip variant="appointment" />
        <div className="grid gap-sm laptop:grid-cols-[minmax(0,1fr)_300px] laptop:items-start">
          <div className="min-w-0">
            <ScheduleAppointment />
          </div>
          <div className="min-w-0">
            <BookedAppointments booked_appointments={bookedAppointments ?? []} />
          </div>
        </div>
        <ScheduleAppointmentModal />
        <ToastWrapper />
      </div>
    </div>
  )
}
