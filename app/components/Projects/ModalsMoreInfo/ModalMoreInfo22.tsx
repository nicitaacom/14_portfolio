"use client"

import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo22() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["22MoreInfo"]}
      onClose={() => closeModal("22MoreInfo")}
      label="22_aer"
      siteUrl="https://22-aer-nicitaa.vercel.app/"
      taskLabel={t("project22Task")}
      deadline="1 month"
      collaborationChildren={
        <>
          <CollaborationIcon tooltiptext={<div className="whitespace-pre-line">{t("project22Owner")}</div>} />
          <CollaborationIcon
            imgSrc="/collaborations/22_aer/ottakist.png"
            profileUrl="https://github.com/ottakist"
            tooltiptext={<div className="whitespace-pre-line">{t("project22Ottakist")}</div>}
          />
          <CollaborationIcon
            imgSrc="/collaborations/22_aer/arifm6.png"
            profileUrl="https://github.com/arifm6"
            tooltiptext={<div className="whitespace-pre-line">{t("project22Arif")}</div>}
          />
        </>
      }
    />
  )
}
