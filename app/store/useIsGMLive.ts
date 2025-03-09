import { create } from "zustand"

interface IsGMLive {
  isGMLive: boolean
  setIsGMLive: (isGMLive: boolean) => void
}

export const useIsGMLive = create<IsGMLive>()(set => ({
  isGMLive: false,
  setIsGMLive: (isGMLive: boolean) => set({ isGMLive }),
}))
