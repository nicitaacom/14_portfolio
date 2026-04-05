"use client"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo15() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["15MoreInfo"]}
      onClose={() => closeModal("15MoreInfo")}
      label="15_HooBank"
      siteUrl="https://15-hoo-bank.vercel.app/"
      taskLabel="Create frontend part for bank"
      deadline="2 weeks"
      collaborationChildren={<CollaborationIcon tooltiptext={<>Whole site</>} />}
    />
  )
}
