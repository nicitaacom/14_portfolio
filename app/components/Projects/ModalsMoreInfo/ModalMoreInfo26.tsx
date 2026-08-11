"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { publicReposMap, trackedProjectsMap } from "@/data/repos"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"
import { project26Achievements } from "@/data/project26Achievements"

export default function ModalMoreInfo26() {
  const project = trackedProjectsMap["project-26-hot-delivery"]

  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["26MoreInfo"]}
      onClose={() => closeModal("26MoreInfo")}
      label="Hot delivery"
      siteUrl={publicReposMap[26].url}
      taskLabel={t("project26Task")}
      stack={project.stack}
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
