import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface FingerprintStore {
  fingerprint: string | null
  setFingerprint: (fingerprint: string, computedAt: number) => void

  computedAt: number | null
}

type SetState = (partial: Partial<FingerprintStore>) => void

function fingerprintStore(set: SetState): FingerprintStore {
  return {
    fingerprint: null,
    setFingerprint: (fingerprint: string, computedAt: number) => set({ fingerprint, computedAt }),

    computedAt: null,
  }
}

export const useFingerprintStore = create<FingerprintStore>()(
  persist(fingerprintStore, {
    name: "fingerprintStore",
    storage: createJSONStorage(() => localStorage),
  }),
)
