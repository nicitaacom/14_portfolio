"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"

export default function ModalMoreInfoNexgem() {
  const project = trackedProjectsMap["project-nexgem-automation-platform"]

  const t = useScopedI18n("nexgemProject.modal")

  return (
    <ModalMoreInfo
      modalQuery="nexgemMoreInfo"
      label={t("label")}
      taskLabel={t("task")}
      stack={project.stack}
      collaborators={[{ name: "nicitaacom", imgSrc: webAvatar.src, description: t("contribution") }]}
    />
  )
}
