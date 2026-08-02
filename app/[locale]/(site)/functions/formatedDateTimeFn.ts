import moment, { MomentInput } from "moment"
import { convertCurrentToTargetTimezone } from "./convertCurrentToTargetTimezone"
import { useAppointmentStore } from "@/store/useAppointmentStore"

/**
 *
 * @param MSK - is Europe/Moscow
 * @returns - formated date time based on state that choosed on ScheduleAppointment.tsx
 */
export function formatedDateTimeFn(MSK?: boolean) {
  const { selectedDate, selectedTime, selectedTimezone } = useAppointmentStore.getState()
  const formattedDate = moment(selectedDate as MomentInput).format("DD.MM.YYYY")

  const at = MSK ? convertCurrentToTargetTimezone(selectedTime, selectedTimezone, "Europe/Moscow") : selectedTime
  const timezone = MSK ? "Europe/Moscow" : selectedTimezone

  return `${formattedDate} at ${at} ${timezone}\n`
}
