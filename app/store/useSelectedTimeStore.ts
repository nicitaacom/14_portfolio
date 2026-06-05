import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"
import { create } from "zustand"
import moment from "moment-timezone"

/**
 * @selectedTime - e.g 10:00 or 23:59
 * @setSelectedTime - pass here string like 22:32
 */
interface SelectedTimeStore {
  selectedTime: string
  setSelectedTime: (time: string) => void
}

const nowMSK = moment.tz("Europe/Moscow")
const currentHour = nowMSK.hours()
const currentMinute = nowMSK.minutes()
const nextAvailableTime = appointmentTimesMSK.find(({ time }) => {
  const [hour, minute] = time.split(":").map(Number)

  // Adjusting logic to disable times like 13:30 if it's passed
  if (currentHour < 12 || currentHour >= 22) {
    return hour === 12 && minute === 0 // Set to 12:00 next day
  }

  // Adjust logic to show next available slot after current time
  if (currentHour < hour || (currentHour === hour && currentMinute < minute)) {
    return true
  }

  return false
})

// If no time is available for today, return the first time (12:00 MSK)
const initialTime = nextAvailableTime ? nextAvailableTime.time : "12:00"

// if now 19:23 - show 20:00
// if now 19:44 - show 20:30
// if now 22:00 - show 12:00
// if now 8:40 - show 12:00
// if now 13:10 - show 14:00
// if now 12:00 - show 13:00
// if now 11:59 - show 12:30

export const useSelectedTimeStore = create<SelectedTimeStore>()(set => ({
  selectedTime: initialTime,
  setSelectedTime: (time: string) => set({ selectedTime: time }),
}))
