"use client"
import { Button } from "@/components/Button"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/useModalsStore"

export function DoneButton() {
  const { closeModal } = useModalsStore()
  const t = useScopedI18n("common")

  return (
    <div className="flex w-full justify-end pt-xs">
      <Button
        className="w-full rounded-[12px] border-cta px-md py-xs font-bold tablet:w-fit"
        onClick={() => closeModal("Appointment")}>
        {t("done")}
      </Button>
    </div>
  )
}
