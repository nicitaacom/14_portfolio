import moment from "moment"

import { formatInstantInZone } from "@/libs/appointmentSlots"
import { useAppointmentStore } from "@/store/useAppointmentStore"

/** Format the selected or confirmed full instant without combining clocks from different dates. */
export function formatedDateTimeFn(MSK = false, startsAtOverride?: string) {
  const state = useAppointmentStore.getState()
  const startsAt = startsAtOverride ?? (state.step === "step-3" ? state.confirmedBooking?.startsAt : state.selectedSlotStart)
  if (!startsAt) return ""
  const timezone = MSK ? "Europe/Moscow" : state.selectedTimezone
  const display = formatInstantInZone(startsAt, timezone)
  if (!display) return ""
  const date = moment.utc(display.date, "YYYY-MM-DD", true).format("DD.MM.YYYY")
  return `${date} at ${display.time} ${timezone}\n`
}
