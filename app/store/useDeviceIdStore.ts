import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface DeviceIdStore {
  deviceId: string | null
  setDeviceId: (deviceId: string) => void
}

export const useDeviceIdStore = create<DeviceIdStore>()(
  persist(
    set => ({
      deviceId: null,
      setDeviceId: (deviceId: string) => set({ deviceId }),
    }),
    {
      name: "14-device-id",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
