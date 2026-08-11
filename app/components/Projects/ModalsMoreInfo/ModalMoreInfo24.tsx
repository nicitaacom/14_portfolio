"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/useModalsStore"

export default function ModalMoreInfo24() {
  const project = trackedProjectsMap["project-24-dashboard-mui"]

  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["24MoreInfo"]}
      onClose={() => closeModal("24MoreInfo")}
      label="24_dashboard-mui"
      siteUrl="https://24-dashboard-mui.vercel.app"
      taskLabel={t("project24Task")}
      stack={project.stack}
      deadline="2 weeks"
      collaborators={[{ description: t("project24Collaboration") }]}
    />
  )
}
