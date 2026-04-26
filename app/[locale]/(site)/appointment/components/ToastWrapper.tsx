"use client"

import { Toast } from "@/components/Toast"
import useToast from "@/store/useToast"
import { AnimatePresence } from "framer-motion"

export function ToastWrapper() {
  const toast = useToast()

  return <AnimatePresence>{toast.isOpen && <Toast />}</AnimatePresence>
}
