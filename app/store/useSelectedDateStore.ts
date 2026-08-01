import { create } from "zustand"

type ValuePiece = Date | null

export type Value = ValuePiece | [ValuePiece, ValuePiece]

interface SelectedDateStore {
  selectedDate: Value
  setSelectedDate: (value: Value) => void
}

// `new Date()` at module scope runs once on the server (server's own timezone) and again on
// the client (browser's local timezone), so the two renders land on different calendar days
// near midnight - Next.js flags it as a hydration mismatch. The real default is set client-side
// in ScheduleAppointment's mount effect instead.
export const useSelectedDateStore = create<SelectedDateStore>()(set => ({
  selectedDate: null,
  setSelectedDate: (value: Value) => set({ selectedDate: value }),
}))
