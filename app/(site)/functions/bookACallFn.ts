import { sendTelegramMessageAction } from "../actions/sendTelegramMessageAction"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { formatedDateTimeFn } from "./formatedDateTimeFn"
import { convertCurrentToTargetTimezone } from "./convertCurrentToTargetTimezone"
import useToast from "@/store/useToast"
import { scheduleTgNtfctnAction } from "../actions/scheduleTgNtfctnAction"

export async function bookACallFn() {
  const { sendNotificationTo, inputNotificationTo, channel,selectedDate,selectedTime,selectedTimezone } = useAppointmentStore.getState()
  const { setNextStep, appointmentNote } = useAppointmentStore.getState()
  
  const toast = useToast.getState()

  const atMSK = convertCurrentToTargetTimezone(selectedTime, selectedTimezone, "Europe/Moscow")

  let message = formatedDateTimeFn(true)
  if (inputNotificationTo.length > 3) {
    message += `Send notifiaction to ${sendNotificationTo}: ${inputNotificationTo}\n`
  }
  if (appointmentNote.length > 3) {
    message += `Appointment note: ${appointmentNote}\n`
  }
  message += `Where: ${channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : channel}\n`

  try {
    // in API route to keep error handling (in server action error handling in prod doesn't work)
    // create a server action here
    // TODO - make sure that everything works fine
    await sendTelegramMessageAction(message) // this is already implemented
    await scheduleTgNtfctnAction(message, selectedDate, atMSK, channel, sendNotificationTo, inputNotificationTo) // this is already implemented
    setNextStep()
  } catch (error) {
    if (error instanceof Error) {
      toast.show("error", "Error booking a call", error.message, 15000)
    }
  }
}
