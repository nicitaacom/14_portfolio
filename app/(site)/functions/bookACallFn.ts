import { sendTelegramMessageAction } from "../actions/sendTelegramMessageAction"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { formatedDateTimeFn } from "./formatedDateTimeFn"
import { convertCurrentToTargetTimezone } from "./convertCurrentToTargetTimezone"
import useToast from "@/store/useToast"
import { scheduleTgNtfctnAction } from "../actions/scheduleTgNtfctnAction"
import { useSelectedDateStore } from "@/store/useSelectedDateStore"
import { useSelectedTimeStore } from "@/store/useSelectedTimeStore"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { TAPIInsertBooking } from "@/app/api/insert/booking/route"

export async function bookACallFn() {
  const { contactMethod, contact, isSendNotification, sendNotificationTo, inputNotificationTo, channel } =
    useAppointmentStore.getState()
  const { selectedDate } = useSelectedDateStore.getState()
  const { selectedTime } = useSelectedTimeStore.getState()
  const { selectedTimezone } = useSelectedTimezoneStore.getState()
  const { setNextStep, appointmentNote } = useAppointmentStore.getState()

  const toast = useToast.getState()

  const atMSK = convertCurrentToTargetTimezone(selectedTime, selectedTimezone, "Europe/Moscow")

  let message = formatedDateTimeFn(true)
  message += `Contact: ${contactMethod}: ${contact}\n`
  if (isSendNotification && inputNotificationTo.length > 3) {
    message += `Send notifiaction to ${sendNotificationTo}: ${inputNotificationTo}\n`
  }
  if (appointmentNote.length > 3) {
    message += `Appointment note: ${appointmentNote}\n`
  }
  message += `Where: ${channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : channel}\n`

  try {
    const payload: TAPIInsertBooking = {
      selectedDate,
      atMSK,
      channel,
      contactType: contactMethod,
      contact,
    }

    const response = await fetch("/api/insert/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    await sendTelegramMessageAction(message)

    if (isSendNotification && inputNotificationTo.length > 3) {
      await scheduleTgNtfctnAction(message, selectedDate, atMSK, channel, sendNotificationTo, inputNotificationTo)
    }

    setNextStep()
  } catch (error) {
    if (error instanceof Error) {
      toast.show("error", "Error booking a call", error.message, 15000)
    }
  }
}
