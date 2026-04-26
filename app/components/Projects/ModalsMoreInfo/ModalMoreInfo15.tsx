"use client"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo15() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["15MoreInfo"]}
      onClose={() => closeModal("15MoreInfo")}
      label="15_HooBank"
      siteUrl="https://15-hoo-bank.vercel.app/"
      taskLabel={t("project15Task")}
      deadline="2 weeks"
      collaborationChildren={<CollaborationIcon tooltiptext={t("wholeSite")} />}
    />
  )
}
