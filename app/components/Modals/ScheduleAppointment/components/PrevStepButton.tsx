"use client"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { IoIosArrowRoundBack } from "react-icons/io"
import { twMerge } from "tailwind-merge"

export function PrevStepButton({ disabled }: { disabled: boolean }) {
  const { setPrevStep } = useAppointmentStore()

  return (
    <button
      className={twMerge(
        "group flex w-fit items-center gap-[2px] rounded-[8px] border border-[#777777] px-xs py-[4px] text-xs text-secondary-foreground transition-colors duration-300 hover:border-cta hover:text-secondary",
        disabled && "opacity-50 cursor-default pointer-events-none",
      )}
      onClick={setPrevStep}>
      <IoIosArrowRoundBack className="text-cta transition-transform duration-300 group-hover:-translate-x-[3px]" size={20} />
      <span className="pb-[1px]">Back</span>
    </button>
  )
}
