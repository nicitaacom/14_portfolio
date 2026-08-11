"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { trackedProjectsMap } from "@/data/repos"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo20() {
  const project = trackedProjectsMap["project-20-flowmazon-clone"]

  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["20MoreInfo"]}
      onClose={() => closeModal("20MoreInfo")}
      label="20_flowmazon-clone"
      siteUrl="https://github.com/nicitaacom/20_flowmazon-clone"
      taskLabel="Improve FullStack WEB developer skill"
      stack={project.stack}
      deadline="no deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
