"use client"

import { useModalsStore } from "@/store/modalsStore"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo19() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["19MoreInfo"]}
      onClose={() => closeModal("19MoreInfo")}
      label="19_spotify-clone"
      siteUrl="https://github.com/Nicitaa/15_HooBank"
      taskLabel="Improve FullStack developer skill"
      deadline="no deadline"
      price="0$"
      collaborationChildren={<CollaborationIcon tooltiptext={<>Whole site</>} />}
    />
  )
}
