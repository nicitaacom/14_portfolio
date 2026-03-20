"use client"
import { Button } from "@/components/Button"
import { useModalsStore } from "@/store/modalsStore"

export function DoneButton() {
  const { closeModal } = useModalsStore()

  return (
    <div className="flex w-full justify-end pt-xs">
      <Button
        className="w-full rounded-[12px] border-cta px-md py-xs font-bold tablet:w-fit"
        onClick={() => closeModal("Appointment")}>
        Done
      </Button>
    </div>
  )
}
