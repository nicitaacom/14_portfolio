"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/useModalsStore"
import { project22Achievements } from "@/data/project22Achievements"

export default function ModalMoreInfo22() {
  const project = trackedProjectsMap["project-22-aer"]

  const { isOpen, closeModal } = useModalsStore()
  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      isOpen={isOpen["22MoreInfo"]}
      onClose={() => closeModal("22MoreInfo")}
      label="22_aer"
      siteUrl="https://22-aer-nicitaa.vercel.app/"
      taskLabel={t("project22Task")}
      stack={project.stack}
      deadline="1 month"
      collaborators={[
        { description: project22Achievements },
        {
          name: "ottakist",
          imgSrc: "/collaborations/22_aer/ottakist.png",
          collaboratorUrl: "https://github.com/ottakist",
          description: t("project22Ottakist"),
        },
        {
          name: "arifm6",
          imgSrc: "/collaborations/22_aer/arifm6.png",
          collaboratorUrl: "https://github.com/arifm6",
          description: t("project22Arif"),
        },
      ]}
    />
  )
}
