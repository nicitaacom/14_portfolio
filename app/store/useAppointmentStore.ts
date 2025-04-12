import { create } from "zustand"

export type Step = "step-1" | "step-2" | "step-3"
export type Channel = "telegram" | "discord" | "google-meets" | null
export type SendNotificationTo = "tg" | "dis" | "email"

interface AppointmentStore {
  step: Step
  direction: "next" | "prev"
  prevDirection: "next" | "prev"
  channel: Channel
  appointmentNote: string
  setAppointmentNote: (appointmentNote: string) => void
  isShowUpOnACall: boolean
  isSendNotification: boolean
  sendNotificationTo: SendNotificationTo
  inputNotificationTo: string
  isCustomNotification: boolean
  setStep: (step: Step) => void
  setNextStep: () => void
  setPrevStep: () => void
  setChannel: (channel: Channel) => void
  toggleIsShowUpOnACall: () => void
  toggleIsSendNotification: () => void
  setInputNotificationTo: (inputValue: string) => void
  setNextSendNotificationTo: () => void
  toggleIsCustomNotification: () => void
}

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
  step: "step-1",
  direction: "next",
  prevDirection: "next",
  channel: null,
  appointmentNote: "",
  isShowUpOnACall: false,
  isSendNotification: false,
  sendNotificationTo: "email",
  inputNotificationTo: "",
  isCustomNotification: false,
  setStep: (step: Step) => set(() => ({ step })),
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
  toggleIsShowUpOnACall: () => set(state => ({ isShowUpOnACall: !state.isShowUpOnACall })),
  toggleIsSendNotification: () => set(state => ({ isSendNotification: !state.isSendNotification })),
  setInputNotificationTo: (inputValue: string) => set(() => ({ inputNotificationTo: inputValue })),
  setNextSendNotificationTo: () =>
    set(state => ({
      sendNotificationTo:
        state.sendNotificationTo === "tg" ? "dis" : state.sendNotificationTo === "dis" ? "email" : "tg",
    })),
  toggleIsCustomNotification: () => set(() => ({ isCustomNotification: !get().isCustomNotification })),
}))
