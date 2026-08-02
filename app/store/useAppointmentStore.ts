import { create } from "zustand"

export type Step = "step-1" | "step-2" | "step-3"
export type Channel = "telegram" | "discord" | "google-meets" | null
export type SendNotificationTo = "tg" | "dis" | "email"
export type ContactMethod = "telegram" | "discord" | "email" | "linkedin"

interface AppointmentStore {
  step: Step
  setStep: (step: Step) => void

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
