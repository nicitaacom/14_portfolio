"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfo17() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["17MoreInfo"]}
      onClose={() => closeModal("17MoreInfo")}
      label="17_messenger-clone"
      siteUrl="https://github.com/nicitaacom/17_messenger-clone"
      taskLabel="Build some clone to improve skills"
      stack={projectStacks.project17}
      deadline="no deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
