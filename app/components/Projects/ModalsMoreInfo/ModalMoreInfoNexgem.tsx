"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfoNexgem() {
  const t = useScopedI18n("nexgemProject.modal")
  const { isOpen, closeModal } = useModalsStore()

  return (
    <ModalMoreInfo
      isOpen={isOpen["nexgemMoreInfo"]}
      onClose={() => closeModal("nexgemMoreInfo")}
      label={t("label")}
      taskLabel={t("task")}
      stack={projectStacks.projectNexgem}
      collaborators={[{ name: "nicitaacom", imgSrc: webAvatar.src, description: t("contribution") }]}
    />
  )
}
