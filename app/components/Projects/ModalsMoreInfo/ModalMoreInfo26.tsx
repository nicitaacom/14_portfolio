"use client"

import { useModalsStore } from "@/store/modalsStore"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"

export default function ModalMoreInfo26() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["26MoreInfo"]}
      onClose={() => closeModal("26MoreInfo")}
      label="Hot delivery"
      siteUrl="https://hot-delivery.vercel.app/"
      taskLabel={t("project26Task")}
      deadline="2 weeks"
      collaborators={[
        {
          imgSrc: webAvatar.src,
          description: t("project26Collaboration"),
        },
      ]}
    />
  )
}
