"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { trackedProjectsMap } from "@/data/repos"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo28() {
  const project = trackedProjectsMap["project-28-notion-clone"]

  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["28MoreInfo"]}
      onClose={() => closeModal("28MoreInfo")}
      label="28_HooBank"
      siteUrl="https://github.com/nicitaacom/28_notion-clone"
      taskLabel="Develop skill to change something on click"
      stack={project.stack}
      deadline="No deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
