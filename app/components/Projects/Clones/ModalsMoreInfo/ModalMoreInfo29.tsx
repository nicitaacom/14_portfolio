"use client"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/useModalsStore"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfo29() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["29MoreInfo"]}
      onClose={() => closeModal("29MoreInfo")}
      label="AI companion"
      siteUrl="https://29-ai-companion.vercel.app/"
      taskLabel="Develop a skill of creating SaaS and get experience with shadcn and cypress"
      stack={projectStacks.project29}
      deadline="2 weeks"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
