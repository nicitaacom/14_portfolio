import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface DeviceIdStore {
  deviceId: string | null
  setDeviceId: (deviceId: string) => void
}

type SetState = (partial: Partial<DeviceIdStore>) => void

function deviceIdStore(set: SetState): DeviceIdStore {
  return {
    deviceId: null,
    setDeviceId: (deviceId: string) => set({ deviceId }),
  }
}

export const useDeviceIdStore = create<DeviceIdStore>()(
  persist(deviceIdStore, {
    name: "deviceIdStore",
    storage: createJSONStorage(() => localStorage),
  }),
)
