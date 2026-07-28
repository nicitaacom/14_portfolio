"use client"

import { useModalsStore } from "@/store/modalsStore"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfo19() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["19MoreInfo"]}
      onClose={() => closeModal("19MoreInfo")}
      label="19_spotify-clone"
      siteUrl="https://github.com/Nicitaa/15_HooBank"
      taskLabel="Improve FullStack developer skill"
      stack={projectStacks.project19}
      deadline="no deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
