"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfo24() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["24MoreInfo"]}
      onClose={() => closeModal("24MoreInfo")}
      label="24_dashboard-mui"
      siteUrl="https://24-dashboard-mui.vercel.app"
      taskLabel={t("project24Task")}
      stack={projectStacks.project24}
      deadline="2 weeks"
      collaborators={[{ description: t("project24Collaboration") }]}
    />
  )
}
