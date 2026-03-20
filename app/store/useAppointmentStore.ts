import { create } from "zustand"

export type Step = "step-1" | "step-2" | "step-3"
export type Channel = "telegram" | "discord" | "google-meets" | null
export type SendNotificationTo = "tg" | "dis" | "email"
export type ContactMethod = "telegram" | "discord" | "email" | "linkedin"

interface AppointmentStore {
  step: Step
  direction: "next" | "prev"
  prevDirection: "next" | "prev"
  channel: Channel
  contactMethod: ContactMethod
  contact: string
  appointmentNote: string
  setContact: (contact: string) => void
  setAppointmentNote: (appointmentNote: string) => void
  isShowUpOnACall: boolean
  isSendNotification: boolean
  sendNotificationTo: SendNotificationTo
  inputNotificationTo: string
  setStep: (step: Step) => void
  setNextStep: () => void
  setPrevStep: () => void
  setChannel: (channel: Channel) => void
  setNextContactMethod: () => void
  toggleIsShowUpOnACall: () => void
  toggleIsSendNotification: () => void
  setInputNotificationTo: (inputValue: string) => void
  setNextSendNotificationTo: () => void
}

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
  step: "step-1",
  direction: "next",
  prevDirection: "next",
  channel: null,
  contactMethod: "email",
  contact: "",
  appointmentNote: "",
  isShowUpOnACall: false,
  isSendNotification: false,
  sendNotificationTo: "email",
  inputNotificationTo: "",
  setStep: (step: Step) => set(() => ({ step })),
  setContact: (contact: string) => set(() => ({ contact })),
  setAppointmentNote: (appointmentNote: string) => set(() => ({ appointmentNote })),
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
  setChannel: (channel: Channel) => set(() => ({ channel })),
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
  toggleIsShowUpOnACall: () => set(state => ({ isShowUpOnACall: !state.isShowUpOnACall })),
  toggleIsSendNotification: () => set(state => ({ isSendNotification: !state.isSendNotification })),
  setInputNotificationTo: (inputValue: string) => set(() => ({ inputNotificationTo: inputValue })),
  setNextSendNotificationTo: () =>
    set(state => ({
      sendNotificationTo:
        state.sendNotificationTo === "tg" ? "dis" : state.sendNotificationTo === "dis" ? "email" : "tg",
    })),
}))
