"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/useModalsStore"

export default function ModalMoreInfoRizAdminDashboard() {
  const project = trackedProjectsMap["project-riz-admin-dashboard"]

  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["rizAdminDashboard"]}
      onClose={() => closeModal("rizAdminDashboard")}
      label={t("projectRizLabel")}
      siteUrl="https://admin.waka.cool/not-deployed"
      taskLabel={t("projectRizTask")}
      stack={project.stack}
      deadline={t("noDeadline")}
      collaborators={[{ description: t("projectRizCollaboration") }]}
    />
  )
}
