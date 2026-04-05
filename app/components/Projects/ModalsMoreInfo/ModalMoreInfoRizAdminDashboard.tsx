"use client"

import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfoRizAdminDashboard() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["rizAdminDashboard"]}
      onClose={() => closeModal("rizAdminDashboard")}
      label="riz admin dashboard"
      siteUrl="https://admin.waka.cool/not-deployed"
      taskLabel="Add way to create/update/delete person with UI through admin dashboard"
      deadline="no deadline"
      collaborationChildren={<CollaborationIcon tooltiptext={<>Whole site + UI/UX design</>} />}
    />
  )
}
