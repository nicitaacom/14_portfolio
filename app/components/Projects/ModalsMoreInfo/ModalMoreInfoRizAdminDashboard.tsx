"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfoRizAdminDashboard() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["rizAdminDashboard"]}
      onClose={() => closeModal("rizAdminDashboard")}
      label="riz admin dashboard"
      siteUrl="https://admin.waka.cool/not-deployed"
      taskLabel={t("projectRizTask")}
      deadline={t("noDeadline")}
      collaborators={[{ description: t("wholeSiteUiUx") }]}
    />
  )
}
