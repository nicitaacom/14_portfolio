"use client"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo16() {
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
      collaborators={[
        {
          name: "Kilomebit17",
          imgSrc: "/collaborations/16_gericht-restaurant/Kilomebit17.png",
          profileUrl: "https://github.com/Kilomebit17",
          description: t("project16CollaborationLead"),
        },
        { description: t("wholeSite") },
      ]}
    />
  )
}
