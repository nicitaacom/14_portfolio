import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface FingerprintStore {
  fingerprint: string | null
  setFingerprint: (fingerprint: string, computedAt: number) => void

  computedAt: number | null
}

export const useFingerprintStore = create<FingerprintStore>()(
  persist(
    set => ({
      fingerprint: null,
      setFingerprint: (fingerprint: string, computedAt: number) => set({ fingerprint, computedAt }),

      computedAt: null,
    }),
    {
      name: "14-fingerprint-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
