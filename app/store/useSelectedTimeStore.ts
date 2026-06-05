import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"
import { create } from "zustand"
import moment from "moment-timezone"

interface SelectedTimeStore {
  selectedTime: string
  setSelectedTime: (time: string) => void
}

function getInitialTimeMSK(): string {
  const now = moment.tz("Europe/Moscow")
  const h = now.hours()
  const m = now.minutes()
  if (h < 12 || h >= 22) return "12:00"
  return (
    appointmentTimesMSK.find(({ time }) => {
      const [hour, minute] = time.split(":").map(Number)
      return hour > h || (hour === h && minute > m)
    })?.time ?? "12:00"
  )
}

export const useSelectedTimeStore = create<SelectedTimeStore>()(set => ({
  selectedTime: getInitialTimeMSK(),
  setSelectedTime: (time: string) => set({ selectedTime: time }),
}))
