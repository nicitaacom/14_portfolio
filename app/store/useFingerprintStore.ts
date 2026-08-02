import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface FingerprintStore {
  fingerprint: string | null
  computedAt: number | null
  setFingerprint: (fingerprint: string, computedAt: number) => void
}

export const useFingerprintStore = create<FingerprintStore>()(
  persist(
    set => ({
      fingerprint: null,
      computedAt: null,
      setFingerprint: (fingerprint: string, computedAt: number) => set({ fingerprint, computedAt }),
    }),
    {
      name: "14-fingerprint-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
