import { create } from "zustand"

interface NewYearAmbience {
  /* Set by the navbar toggle. NewYearFireworksEvent reads it to decide whether the sky runs its
     occasional close-up display or the quiet distant one that goes with the soundtrack */
  isAmbienceOn: boolean
  setIsAmbienceOn: (isAmbienceOn: boolean) => void
}

// Option 4 of the rule's own list - one value and its setter, but the two sides are the navbar
// toggle and the fireworks canvas, which sit in different trees with no common parent to hold a
// useState. Neither importer has a related pair to move in here either, and unlike isGMLive there
// is no server value to read at the source - the toggle is the only thing that sets it.
// eslint-disable-next-line local/zustand-no-pointless-store
export const useNewYearAmbience = create<NewYearAmbience>()(set => ({
  isAmbienceOn: false,
  setIsAmbienceOn: (isAmbienceOn: boolean) => set({ isAmbienceOn }),
}))
