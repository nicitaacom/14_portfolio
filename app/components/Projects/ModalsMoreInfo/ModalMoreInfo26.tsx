"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"
import { projectStacks } from "@/data/projectStacks"
import { project26Achievements } from "@/data/project26Achievements"
import { repos } from "@/data/repos"

export default function ModalMoreInfo26() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["26MoreInfo"]}
      onClose={() => closeModal("26MoreInfo")}
      label="Hot delivery"
      siteUrl={repos[25].url}
      taskLabel={t("project26Task")}
      stack={projectStacks.project26}
      deadline="2 weeks"
      collaborators={[
        {
          imgSrc: webAvatar.src,
          description: project26Achievements,
        },
      ]}
    />
  )
}
