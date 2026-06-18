"use client"

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
      collaborators={[
        { description: t("project22Owner") },
        {
          name: "ottakist",
          imgSrc: "/collaborations/22_aer/ottakist.png",
          profileUrl: "https://github.com/ottakist",
          description: t("project22Ottakist"),
        },
        {
          name: "arifm6",
          imgSrc: "/collaborations/22_aer/arifm6.png",
          profileUrl: "https://github.com/arifm6",
          description: t("project22Arif"),
        },
      ]}
    />
  )
}
