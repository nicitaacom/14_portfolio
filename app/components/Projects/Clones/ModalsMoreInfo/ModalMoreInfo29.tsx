"use client"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useModalsStore } from "@/store/useModalsStore"

export default function ModalMoreInfo29() {
  const project = trackedProjectsMap["project-29-ai-companion"]

  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["29MoreInfo"]}
      onClose={() => closeModal("29MoreInfo")}
      label="AI companion"
      siteUrl="https://29-ai-companion.vercel.app/"
      taskLabel="Develop a skill of creating SaaS and get experience with shadcn and cypress"
      stack={project.stack}
      deadline="2 weeks"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
