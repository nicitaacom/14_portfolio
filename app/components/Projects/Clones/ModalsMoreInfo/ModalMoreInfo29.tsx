"use client"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo29() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["29MoreInfo"]}
      onClose={() => closeModal("29MoreInfo")}
      label="AI companion"
      siteUrl="https://29-ai-companion.vercel.app/"
      taskLabel="Develop a skill of creating SaaS and get experience with shadcn and cypress"
      deadline="2 weeks"
      price="0$"
      collaborationChildren={<CollaborationIcon tooltiptext={<>Whole site</>} />}
    />
  )
}
