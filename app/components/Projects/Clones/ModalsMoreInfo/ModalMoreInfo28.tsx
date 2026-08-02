"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfo28() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["28MoreInfo"]}
      onClose={() => closeModal("28MoreInfo")}
      label="28_HooBank"
      siteUrl="https://github.com/nicitaacom/28_notion-clone"
      taskLabel="Develop skill to change something on click"
      stack={projectStacks.project28}
      deadline="No deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
