"use client"

import { twMerge } from "tailwind-merge"

import { useModalsStore } from "@/store/modalsStore"
import { ModalContainer } from "../ModalContainer"
import { TModals } from "@/interfaces/TModals"
import { Step1 } from "./components/Step1"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { Step2 } from "./components/Step2"
import { AnimatePresence, motion } from "framer-motion"
import { ScheduleAppointmentModalHeader } from "./components/ScheduleAppointmentModalHeader"
import { Step3 } from "./components/Step3/Step3"

export function ScheduleAppointmentModal() {
  const { isOpen, closeModal } = useModalsStore()

  const { step, direction, prevDirection } = useAppointmentStore()

  const getTransitionProps = (direction: "next" | "prev", prevDirection: "next" | "prev") => {
    // console.log(44, "direction - ", direction)
    // console.log(45, "prevDirection - ", prevDirection)
    // TODO - it doesn't work in way I expect it to work - think why - I think its something to do around frist and last step
    return {
      initial: { x: direction === "next" ? "100%" : "-100%" },
      animate: { x: "0%" },
      exit: { x: prevDirection === "prev" ? "-100%" : "100%" },
      transition: { duration: 0.25 },
    }
  }

  return (
    <ModalContainer
      className={twMerge(
        "duration-300 w-[95vw] max-w-[550px]",
        step === "step-1" && "h-auto min-h-[130px]",
        step === "step-2" && "max-w-[675px] h-auto min-h-[274px]",
        step === "step-3" && "max-w-[650px] h-auto",
      )}
      isOpen={isOpen["Appointment"]}
      onClose={() => closeModal<TModals>("Appointment")}>
      <div
        className="flex flex-col items-center gap-y-md tablet:gap-y-[2rem]
        px-sm tablet:px-[2rem] py-md tablet:py-[1.5rem] tablet:pt-[2rem] overflow-x-hidden">
        <ScheduleAppointmentModalHeader />
        <AnimatePresence mode="wait">
          {step === "step-1" ? (
            <motion.div key={step} className="w-full" {...getTransitionProps(direction, prevDirection)}>
              <Step1 />
            </motion.div>
          ) : step === "step-2" ? (
            <motion.div key={step} className="w-full" {...getTransitionProps(direction, prevDirection)}>
              <Step2 />
            </motion.div>
          ) : (
            <motion.div key={step} className="w-full" {...getTransitionProps(direction, prevDirection)}>
              <Step3 />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalContainer>
  )
}
