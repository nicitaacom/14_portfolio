import { create } from "zustand"

import { TModals } from "@/interfaces/TModals"

interface ModalsStore {
  isOpen: Record<TModals, boolean>
  openModal: <T extends TModals>(id: T) => void
  closeModal: <T extends TModals>(id: T) => void
}

export const useModalsStore = create<ModalsStore>()(set => ({
  isOpen: {} as Record<TModals, boolean>,
  openModal: id => set(state => ({ isOpen: { ...state.isOpen, [id]: true } })),
  closeModal: id => set(state => ({ isOpen: { ...state.isOpen, [id]: false } })),
}))
