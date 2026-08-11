"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/useModalsStore"
import { project23Achievements } from "@/data/project23Achievements"

export default function ModalMoreInfo23() {
  const project = trackedProjectsMap["project-23-store"]

  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["23MoreInfo"]}
      onClose={() => closeModal("23MoreInfo")}
      label="23_store"
      siteUrl="https://github.com/nicitaacom/23_store"
      taskLabel={t("project23Task")}
      stack={project.stack}
      deadline="1 month"
      collaborators={[{ description: project23Achievements }]}
    />
  )
}
