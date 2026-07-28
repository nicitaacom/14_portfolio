"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfoRizAdminDashboard() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["rizAdminDashboard"]}
      onClose={() => closeModal("rizAdminDashboard")}
      label={t("projectRizLabel")}
      siteUrl="https://admin.waka.cool/not-deployed"
      taskLabel={t("projectRizTask")}
      stack={projectStacks.projectRizAdminDashboard}
      deadline={t("noDeadline")}
      collaborators={[{ description: t("projectRizCollaboration") }]}
    />
  )
}
