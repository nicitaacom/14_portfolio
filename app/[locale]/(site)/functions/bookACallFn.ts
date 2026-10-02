import { nanoid } from "nanoid"

import { RateLimitSDK } from "@/classes/RateLimitSDK/RateLimitSDK"
import { TelegramSDK } from "@/classes/TelegramSDK/TelegramSDK"
import { formatInstantInZone } from "@/libs/appointmentSlots"
import { useAppointmentStore } from "@/store/useAppointmentStore"

interface BookACallMessages {
  chooseChannelFirst: string
  dailyLimitReached: () => string
  errorTitle: string
}

export type BookACallResult =
  | { ok: true }
  | { ok: false; code?: API.SlotFailureCode; error: string }

export async function bookACallFn(messages: BookACallMessages): Promise<BookACallResult> {
  const state = useAppointmentStore.getState()
  const {
    contactMethod, contact, isSendNotification, sendNotificationTo, inputNotificationTo, channel,
    selectedSlotStart, setNextStep, appointmentNote, setConfirmedBooking,
  } = state

  if (!channel) {
    return { ok: false, error: messages.chooseChannelFirst }
  }
  if (!selectedSlotStart) return { ok: false, code: "SLOT_UNAVAILABLE", error: "Choose an available time." }

  const attemptedStartsAt = selectedSlotStart
  const moscowDisplay = formatInstantInZone(attemptedStartsAt, "Europe/Moscow")
  const selectedDisplay = formatInstantInZone(attemptedStartsAt, state.selectedTimezone)
  if (!moscowDisplay || !selectedDisplay) return { ok: false, code: "INVALID_SLOT", error: "Choose a valid appointment time." }
  let message = `${moscowDisplay.date} at ${moscowDisplay.time} Europe/Moscow\n`
  message += `Contact: ${contactMethod}: ${contact}\n`
  if (isSendNotification && inputNotificationTo.length > 3) message += `Send notification to ${sendNotificationTo}: ${inputNotificationTo}\n`
  if (appointmentNote.length > 3) message += `Appointment note: ${appointmentNote}\n`
  message += `Where: ${channel === "google-meets" ? '<a href="https://meet.google.com/yiy-pbnd-ygo?pli=1">google-meets</a>' : channel}\n`

  try {
    const rateLimitSDK = new RateLimitSDK()
    const getRemainingResp = await rateLimitSDK.getRemaining("bookACall")
    if (getRemainingResp.remaining <= 0) {
      const error = messages.dailyLimitReached()
      return { ok: false, error }
    }

    const bookingId = nanoid()
    const payload: API.InsertBookingRequest = {
      bookingId,
      startsAt: attemptedStartsAt,
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
      cache: "no-store",
      body: JSON.stringify(payload),
    })
    const result = await response.json() as API.InsertBookingResponse
    if (!response.ok || !result.ok || !result.booking) {
      return { ok: false, code: result.code, error: result.error ?? "The appointment could not be booked." }
    }

    setConfirmedBooking(result.booking)
    try {
      const telegramSDK = new TelegramSDK()
      const sendMessageResponse = await telegramSDK.sendMessage(`Booked call: ${message} \n`)
      if (sendMessageResponse) console.error("Error sending Telegram booking message:", sendMessageResponse)
    } catch (error) {
      console.error("Telegram booking message failed after the booking was saved:", error)
    }
    setNextStep()
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "The appointment could not be booked."
    return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: message }
  }
}
