"use client"

import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"

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
      deadline="2 weeks"
      collaborationChildren={
        <>
          <CollaborationIcon tooltiptext={<div className="whitespace-pre-line">{t("project24Collaboration")}</div>} />
        </>
      }
    />
  )
}
