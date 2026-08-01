"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"
import { projectStacks } from "@/data/projectStacks"
import { project23Achievements } from "@/data/project23Achievements"

export default function ModalMoreInfo23() {
  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["23MoreInfo"]}
      onClose={() => closeModal("23MoreInfo")}
      label="23_store"
      siteUrl="https://github.com/nicitaacom/23_store"
      taskLabel={t("project23Task")}
      stack={projectStacks.project23}
      deadline="1 month"
      collaborators={[{ description: project23Achievements }]}
    />
  )
}
