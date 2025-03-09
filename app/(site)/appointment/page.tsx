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
    <div className="flex flex-col gap-y-md justify-start items-center px-md pt-[8rem]">
      <IsGMLive />
      <ScheduleAppointment bookings={bookings ?? []} />
      <BookedAppointments booked_appointments={booked_appointments ?? []} />
      <ScheduleAppointmentModal />
      <ToastWrapper />
    </div>
  )
}
