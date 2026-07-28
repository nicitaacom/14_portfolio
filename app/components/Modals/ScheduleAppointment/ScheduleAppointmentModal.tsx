"use client"

import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { useModalsStore } from "@/store/modalsStore"
import { ModalContainer } from "../ModalContainer"
import { TModals } from "@/interfaces/TModals"
import { Step1 } from "./components/Step1"
import { Step, useAppointmentStore } from "@/store/useAppointmentStore"
import { Step2 } from "./components/Step2"
import { AnimatePresence, motion } from "framer-motion"
import { ScheduleAppointmentModalHeader } from "./components/ScheduleAppointmentModalHeader"
import { Step3 } from "./components/Step3/Step3"
import { useScopedI18n } from "@/locales/client"

export function ScheduleAppointmentModal() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("appointment.modal")

  const { step } = useAppointmentStore()
  const [isBooking, setIsBooking] = useState(false)

  // this is proper rtl animation that is actually works as expected
  const previousStepRef = useRef(step)
  const stepOrder: Record<Step, number> = {
    "step-1": 0,
    "step-2": 1,
    "step-3": 2,
  }
  const direction = stepOrder[step] >= stepOrder[previousStepRef.current] ? "next" : "prev"

  useEffect(() => {
    previousStepRef.current = step
  }, [step])

  const transitionVariants = {
    initial: (direction: "next" | "prev") => ({
      x: direction === "next" ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: {
      x: "0%",
      opacity: 1,
    },
    exit: (direction: "next" | "prev") => ({
      x: direction === "next" ? "-100%" : "100%",
      opacity: 0,
    }),
  }

  return (
    <ModalContainer
      className={twMerge(
        "duration-300 w-[94vw] max-h-[88vh]",
        step === "step-1" && "max-w-[620px]",
        step === "step-2" && "max-w-[660px]",
        step === "step-3" && "max-w-[620px]",
      )}
      isOpen={isOpen["Appointment"]}
      onClose={() => closeModal<TModals>("Appointment")}>
      <div
        aria-busy={isBooking}
        className="appointment-modal-surface relative flex max-h-[88vh] flex-col gap-md overflow-x-hidden overflow-y-auto px-md pb-md pt-[3.25rem] tablet:px-[1.25rem] tablet:pb-[1.25rem] tablet:pt-[3.5rem]">
        <svg
          aria-hidden="true"
          className="appointment-rust-background pointer-events-none absolute inset-[0] h-full w-full"
          preserveAspectRatio="none">
          <defs>
            <symbol id="appointment-rust-crop" viewBox="258 105 160 80" preserveAspectRatio="none">
              <image href="/UI/crazy-mechanics-menu.png" width="703" height="517" />
            </symbol>
            <pattern id="appointment-rust-pattern" width="640" height="320" patternUnits="userSpaceOnUse">
              <use href="#appointment-rust-crop" width="320" height="160" />
              <use
                href="#appointment-rust-crop"
                width="320"
                height="160"
                transform="translate(640 0) scale(-1 1)"
              />
              <use
                href="#appointment-rust-crop"
                width="320"
                height="160"
                transform="translate(0 320) scale(1 -1)"
              />
              <use
                href="#appointment-rust-crop"
                width="320"
                height="160"
                transform="translate(640 320) scale(-1 -1)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#appointment-rust-pattern)" />
          <rect width="100%" height="100%" fill="rgb(22 12 8 / 0.3)" />
        </svg>
        <ScheduleAppointmentModalHeader />
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          {step === "step-1" ? (
            <motion.div
              key={step}
              className="w-full"
              custom={direction}
              variants={transitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}>
              <Step1 />
            </motion.div>
          ) : step === "step-2" ? (
            <motion.div
              key={step}
              className="w-full"
              custom={direction}
              variants={transitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}>
              <Step2 onBookingStateChange={setIsBooking} />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              className="w-full"
              custom={direction}
              variants={transitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}>
              <Step3 />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isBooking && (
            <motion.div
              role="status"
              aria-live="polite"
              className="appointment-loading-screen absolute inset-[0] z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <span className="sr-only">{t("booking")}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalContainer>
  )
}
