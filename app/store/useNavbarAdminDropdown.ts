import { create } from "zustand"

interface NavbarAdminDropdownStore {
  isShowDropdown: boolean
  setIsShowDropdown: (isShowDropdown: boolean) => void
}

export const useNavbarAdminDropdown = create<NavbarAdminDropdownStore>()(set => ({
  isShowDropdown: false,
  setIsShowDropdown: (isShowDropdown: boolean) => set({ isShowDropdown }),
}))
