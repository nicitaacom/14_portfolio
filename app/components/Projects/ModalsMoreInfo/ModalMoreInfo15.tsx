"use client"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"

export default function ModalMoreInfo15() {
  const project = trackedProjectsMap["project-15-hoobank"]

  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      modalQuery="15MoreInfo"
      label="15_HooBank"
      siteUrl="https://15-hoo-bank.vercel.app/"
      taskLabel={t("project15Task")}
      stack={project.stack}
      deadline="2 weeks"
      collaborators={[{ description: t("wholeSite") }]}
    />
  )
}
