import { create } from "zustand"

interface NewYearAmbience {
  /* Set by the navbar toggle. NewYearFireworksEvent reads it to decide whether the sky runs its
     occasional close-up display or the quiet distant one that goes with the soundtrack */
  isAmbienceOn: boolean
  setIsAmbienceOn: (isAmbienceOn: boolean) => void
}

export const useNewYearAmbience = create<NewYearAmbience>()(set => ({
  isAmbienceOn: false,
  setIsAmbienceOn: (isAmbienceOn: boolean) => set({ isAmbienceOn }),
}))
