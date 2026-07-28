import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"
import { create } from "zustand"
import moment from "moment-timezone"

interface SelectedTimeStore {
  selectedTime: string
  setSelectedTime: (time: string) => void
}

export const DEFAULT_APPOINTMENT_TIME_MSK = appointmentTimesMSK[0].time

export function getNextAvailableTimeMSK(now = moment.tz("Europe/Moscow")): string {
  const h = now.hours()
  const m = now.minutes()
  if (h < 12 || h >= 22) return DEFAULT_APPOINTMENT_TIME_MSK
  return (
    appointmentTimesMSK.find(({ time }) => {
      const [hour, minute] = time.split(":").map(Number)
      return hour > h || (hour === h && minute > m)
    })?.time ?? DEFAULT_APPOINTMENT_TIME_MSK
  )
}

export const useSelectedTimeStore = create<SelectedTimeStore>()(set => ({
  selectedTime: DEFAULT_APPOINTMENT_TIME_MSK,
  setSelectedTime: (time: string) => set({ selectedTime: time }),
}))
