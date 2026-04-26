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
      isOpen={isOpen["16MoreInfo"]}
      onClose={() => closeModal("16MoreInfo")}
      label="16_gericht-restaurant"
      siteUrl="https://16-gericht-restaurant.vercel.app"
      taskLabel={t("project16Task")}
      deadline="1 month"
      collaborationChildren={
        <>
          <CollaborationIcon
            imgSrc="/collaborations/16_gericht-restaurant/Kilomebit17.png"
            profileUrl="https://github.com/Kilomebit17"
            tooltiptext={t("project16CollaborationLead")}
          />
          <CollaborationIcon tooltiptext={t("wholeSite")} />
        </>
      }
    />
  )
}
