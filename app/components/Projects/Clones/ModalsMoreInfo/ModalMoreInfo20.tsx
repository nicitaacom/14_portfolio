"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfo20() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["20MoreInfo"]}
      onClose={() => closeModal("20MoreInfo")}
      label="20_flowmazon-clone"
      siteUrl="https://github.com/nicitaacom/20_flowmazon-clone"
      taskLabel="Improve FullStack WEB developer skill"
      stack={projectStacks.project20}
      deadline="no deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
