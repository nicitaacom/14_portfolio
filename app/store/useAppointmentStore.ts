import { create } from "zustand"

import type { AppointmentSlot } from "@/libs/appointmentSlots"

export type Step = "step-1" | "step-2" | "step-3"
export type Channel = "telegram" | "discord" | "google-meets" | null
export type SendNotificationTo = "tg" | "dis" | "email"
export type ContactMethod = "telegram" | "discord" | "email" | "linkedin"

type ValuePiece = Date | null

export type Value = ValuePiece | [ValuePiece, ValuePiece]

export const DEFAULT_APPOINTMENT_TIMEZONE = "Europe/Moscow"

interface AppointmentStore {
  step: Step
  setStep: (step: Step) => void

  // `new Date()` at module scope runs once on the server (server's own timezone) and again on
  // the client (browser's local timezone), so the two renders land on different calendar days
  // near midnight - Next.js flags it as a hydration mismatch. The real default is set client-side
  // in ScheduleAppointment's mount effect instead.
  selectedDate: Value
  setSelectedDate: (value: Value) => void

  selectedSlotStart: string | null
  setSelectedSlotStart: (startsAt: string | null) => void

  availabilitySlots: AppointmentSlot[]
  availabilityLoading: boolean
  availabilityError: boolean
  availabilityDate: string | null
  availabilityTimezone: string | null
  availabilityServerNow: number | null
  availabilityReceivedAt: number | null
  availabilityRequestId: number
  selectionInvalid: boolean
  setSelectionInvalid: (invalid: boolean) => void

  availabilityNoticeCode: API.SlotFailureCode | null
  setAvailabilityNoticeCode: (code: API.SlotFailureCode | null) => void

  beginAvailabilityRequest: (date: string, timezone: string) => number
  finishAvailabilityRequest: (requestId: number, date: string, timezone: string, serverNow: number, slots: AppointmentSlot[]) => boolean
  failAvailabilityRequest: (requestId: number) => void

  confirmedBooking: { id: string; startsAt: string; bookingDate: string; timeMSK: string } | null
  setConfirmedBooking: (booking: AppointmentStore["confirmedBooking"]) => void

  selectedTimezone: string
  setSelectedTimezone: (timezone: string) => void

  contact: string
  setContact: (contact: string) => void

  appointmentNote: string
  setAppointmentNote: (appointmentNote: string) => void

  channel: Channel
  setChannel: (channel: Channel) => void

  isShowUpOnACall: boolean
  toggleIsShowUpOnACall: () => void

  isSendNotification: boolean
  toggleIsSendNotification: () => void

  inputNotificationTo: string
  setInputNotificationTo: (inputValue: string) => void

  direction: "next" | "prev"
  prevDirection: "next" | "prev"
  contactMethod: ContactMethod
  sendNotificationTo: SendNotificationTo
  setNextStep: () => void
  setPrevStep: () => void
  setNextContactMethod: () => void
  setNextSendNotificationTo: () => void
}

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
  step: "step-1",
  setStep: (step: Step) => set(() => ({ step })),

  selectedDate: null,
  setSelectedDate: (value: Value) => set(() => ({ selectedDate: value })),

  selectedSlotStart: null,
  setSelectedSlotStart: (startsAt: string | null) => set(() => ({ selectedSlotStart: startsAt })),

  availabilitySlots: [],
  availabilityLoading: false,
  availabilityError: false,
  availabilityDate: null,
  availabilityTimezone: null,
  availabilityServerNow: null,
  availabilityReceivedAt: null,
  availabilityRequestId: 0,
  selectionInvalid: false,
  setSelectionInvalid: invalid => set(() => ({ selectionInvalid: invalid })),

  availabilityNoticeCode: null,
  setAvailabilityNoticeCode: code => set(() => ({ availabilityNoticeCode: code })),

  beginAvailabilityRequest: (date, timezone) => {
    const requestId = get().availabilityRequestId + 1
    set(() => ({ availabilityRequestId: requestId, availabilityDate: date, availabilityTimezone: timezone, availabilityLoading: true, availabilityError: false }))
    return requestId
  },
  finishAvailabilityRequest: (requestId, date, timezone, serverNow, slots) => {
    if (get().availabilityRequestId !== requestId) return false
    set(() => ({ availabilityDate: date, availabilityTimezone: timezone, availabilityLoading: false, availabilityError: false, availabilityServerNow: serverNow, availabilityReceivedAt: Date.now(), availabilitySlots: slots }))
    return true
  },
  failAvailabilityRequest: requestId => {
    if (get().availabilityRequestId !== requestId) return
    set(() => ({ availabilityLoading: false, availabilityError: true, availabilitySlots: [], availabilityServerNow: null, availabilityReceivedAt: null }))
  },

  confirmedBooking: null,
  setConfirmedBooking: booking => set(() => ({ confirmedBooking: booking })),

  selectedTimezone: DEFAULT_APPOINTMENT_TIMEZONE,
  setSelectedTimezone: (timezone: string) => set(() => ({ selectedTimezone: timezone })),

  contact: "",
  setContact: (contact: string) => set(() => ({ contact })),

  appointmentNote: "",
  setAppointmentNote: (appointmentNote: string) => set(() => ({ appointmentNote })),

  channel: null,
  setChannel: (channel: Channel) => set(() => ({ channel })),

  isShowUpOnACall: false,
  toggleIsShowUpOnACall: () => set(state => ({ isShowUpOnACall: !state.isShowUpOnACall })),

  isSendNotification: false,
  toggleIsSendNotification: () => set(state => ({ isSendNotification: !state.isSendNotification })),

  inputNotificationTo: "",
  setInputNotificationTo: (inputValue: string) => set(() => ({ inputNotificationTo: inputValue })),

  direction: "next",
  prevDirection: "next",
  contactMethod: "email",
  sendNotificationTo: "email",
  setNextStep: () =>
    set(state => ({
      step: state.step === "step-1" ? "step-2" : "step-3",
      prevDirection: state.direction,
      direction: "next",
    })),
  setPrevStep: () =>
    set(state => ({
      step: state.step === "step-3" ? "step-2" : "step-1",
      prevDirection: state.direction,
      direction: "prev",
    })),
  setNextContactMethod: () =>
    set(state => ({
      contactMethod:
        state.contactMethod === "email"
          ? "telegram"
          : state.contactMethod === "telegram"
            ? "discord"
            : state.contactMethod === "discord"
              ? "linkedin"
              : "email",
    })),
  setNextSendNotificationTo: () =>
    set(state => ({
      sendNotificationTo:
        state.sendNotificationTo === "tg" ? "dis" : state.sendNotificationTo === "dis" ? "email" : "tg",
    })),
}))
