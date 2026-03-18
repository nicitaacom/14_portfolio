import moment from "moment"
import { cookies } from "next/headers"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { ScheduleAppointment } from "./components/ScheduleAppointment"
import { ScheduleAppointmentModal } from "@/components/Modals/ScheduleAppointment/ScheduleAppointmentModal"
import { ToastWrapper } from "./components/ToastWrapper"
import { BookedAppointments } from "./components/BookedAppointments"
import { IsGMLive } from "./components/IsGMLive"

export default async function AppointmentPage() {
  const today = moment().format("YYYY-MM-DD")
  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("booking_date,booking_time_MSK")
    .gte("booking_date", today)
  const { data: booked_appointments } = await supabaseAdmin
    .from("bookings")
    .select()
    .gte("booking_date", today)
    .eq("user_cookie_id", cookies().get("user_cookie_id")?.value ?? "undefined")

  return (
    <div className="flex w-full justify-center overflow-x-hidden px-sm pt-[5.25rem] tablet:px-md tablet:pt-[6rem]">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-md">
        <IsGMLive />
        <div className="grid gap-md laptop:grid-cols-[minmax(0,1fr)_340px] laptop:items-start">
          <div className="min-w-0">
            <ScheduleAppointment bookings={bookings ?? []} />
          </div>
          <div className="min-w-0">
            <BookedAppointments booked_appointments={booked_appointments ?? []} />
          </div>
        </div>
        <ScheduleAppointmentModal />
        <ToastWrapper />
      </div>
    </div>
  )
}
