import { nanoid } from "nanoid"

import { sendTelegramMessageAction } from "../actions/sendTelegramMessageAction"
import { RateLimitSDK } from "@/classes/RateLimitSDK/RateLimitSDK"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { formatedDateTimeFn } from "./formatedDateTimeFn"
import { convertCurrentToTargetTimezone } from "./convertCurrentToTargetTimezone"
import useToast from "@/store/useToast"

interface BookACallMessages {
  chooseChannelFirst: string
  dailyLimitReached: () => string
  errorTitle: string
}

export async function bookACallFn(messages: BookACallMessages) {
  const {
    contactMethod,
    contact,
    isSendNotification,
    sendNotificationTo,
    inputNotificationTo,
    channel,
    selectedDate,
    selectedTime,
    selectedTimezone,
    setNextStep,
    appointmentNote,
  } = useAppointmentStore.getState()

  const toast = useToast.getState()

  const atMSK = convertCurrentToTargetTimezone(selectedTime, selectedTimezone, "Europe/Moscow")

  if (!channel) {
    toast.show("error", messages.errorTitle, messages.chooseChannelFirst, 8000)
    return
  }

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
    const rateLimitSDK = new RateLimitSDK()
    const getRemainingResp = await rateLimitSDK.getRemaining("bookACall")

    if (getRemainingResp.remaining <= 0) {
      toast.show("error", messages.errorTitle, messages.dailyLimitReached(), 15000)
      return
    }

    const bookingId = nanoid()
    const serializedSelectedDate = Array.isArray(selectedDate)
      ? ([selectedDate[0]?.toISOString() ?? null, selectedDate[1]?.toISOString() ?? null] as [string | null, string | null])
      : selectedDate?.toISOString() ?? null

    const payload: API.InsertBookingRequest = {
      bookingId,
      selectedDate: serializedSelectedDate,
      atMSK,
      channel,
      contactType: contactMethod,
      contact,
      isSendNotification,
      sendNotificationTo,
      inputNotificationTo,
    }

    const response = await fetch("/api/insert/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseData = (await response.json()) as API.InsertBookingResponse

    if (!response.ok || !responseData.ok) {
      throw new Error(responseData.error ?? "Failed to insert booking")
    }

    await sendTelegramMessageAction(message)

    setNextStep()
  } catch (error) {
    if (error instanceof Error) {
      toast.show("error", messages.errorTitle, error.message, 15000)
    }
  }
}
