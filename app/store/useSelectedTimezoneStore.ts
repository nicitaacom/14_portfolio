import { create } from "zustand"

interface SelectedTimezoneStore {
  selectedTimezone: string
  setSelectedTimezone: (timezone: string) => void
}

export const DEFAULT_APPOINTMENT_TIMEZONE = "Europe/Moscow"

export const useSelectedTimezoneStore = create<SelectedTimezoneStore>()(set => ({
  selectedTimezone: DEFAULT_APPOINTMENT_TIMEZONE,
  setSelectedTimezone: (timezone: string) => set({ selectedTimezone: timezone }),
}))
