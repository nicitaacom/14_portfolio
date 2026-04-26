"use client"

import { useModalsStore } from "@/store/modalsStore"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"

export default function ModalMoreInfo23() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["23MoreInfo"]}
      onClose={() => closeModal("23MoreInfo")}
      label="23_store"
      siteUrl="https://github.com/nicitaacom/23_store"
      taskLabel={t("project23Task")}
      deadline="1 month"
      collaborationChildren={
        <CollaborationIcon tooltiptext={<div className="whitespace-pre-line">{t("project23Collaboration")}</div>} />
      }
    />
  )
}
