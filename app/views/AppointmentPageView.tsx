import moment from "moment-timezone"
import { cookies } from "next/headers"

import { getIsGMLive } from "@/libs/getIsGMLive"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { NewYearFilmStrip } from "@/components/NewYear/NewYearFilmStrip"
import { ScheduleAppointment } from "../[locale]/(site)/appointment/components/ScheduleAppointment"
import { ScheduleAppointmentModal } from "@/components/Modals/ScheduleAppointment/ScheduleAppointmentModal"
import { ToastWrapper } from "../[locale]/(site)/appointment/components/ToastWrapper"
import { BookedAppointments } from "../[locale]/(site)/appointment/components/BookedAppointments"
import { IsGMLive } from "../[locale]/(site)/appointment/components/IsGMLive"
import { getStoredBookingInstant } from "@/libs/appointmentSlots"

export async function AppointmentPageView() {
  const getIsGMLiveResp = await getIsGMLive()
  const nowMs = Date.now()
  const todayMoscow = moment.tz(nowMs, "Europe/Moscow").format("YYYY-MM-DD")
  const userCookieId = (await cookies()).get("user_cookie_id")?.value
  const { data: bookedAppointments } = userCookieId
    ? await supabaseAdmin.from("bookings").select().gte("booking_date", todayMoscow).eq("user_cookie_id", userCookieId)
    : { data: [] }
  const futureBookings = (bookedAppointments ?? []).filter(booking => {
    const startsAt = getStoredBookingInstant(booking.booking_date, booking.booking_time_MSK)
    return startsAt !== null && Date.parse(startsAt) >= nowMs
  })

  return (
    <div className="appointment-rack flex w-full justify-center overflow-x-hidden px-sm tablet:px-md">
      <div className="appointment-page-shell mx-auto flex w-full max-w-[680px] flex-col gap-sm laptop:max-w-[920px]">
        <IsGMLive isGMLive={getIsGMLiveResp} />
        <section className="new-year-appointment-editorial">
          <NewYearFilmStrip variant="appointment" />
        </section>
        <div className="appointment-workspace grid gap-sm laptop:grid-cols-[minmax(0,1fr)_300px] laptop:items-start">
          <div className="min-w-0">
            <ScheduleAppointment />
          </div>
          <div className="min-w-0">
            <BookedAppointments booked_appointments={futureBookings} />
          </div>
        </div>
        <ScheduleAppointmentModal />
        <ToastWrapper />
      </div>
    </div>
  )
}
