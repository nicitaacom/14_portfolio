"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { NDAContributionDetails, NDANotice } from "@/components/Projects/NDAContributionDetails"
import { ndaAchievementSections, ndaAchievements } from "@/data/ndaProject"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/useModalsStore"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"
import { projectStacks } from "@/data/projectStacks"

export default function ModalMoreInfoNDA() {
  const t = useScopedI18n("ndaProject.modal")
  const { isOpen, closeModal } = useModalsStore()

  return (
    <ModalMoreInfo
      isOpen={isOpen["ndaMoreInfo"]}
      onClose={() => closeModal("ndaMoreInfo")}
      label={t("label")}
      badge={t("badge")}
      contributionTitle={t("contributionTitle")}
      notice={<NDANotice />}
      taskLabel={t("task")}
      stack={projectStacks.projectNda}
      collaborators={[
        {
          name: "nicitaacom",
          imgSrc: webAvatar.src,
          description: (
            <NDAContributionDetails achievements={ndaAchievements} achievementSections={ndaAchievementSections} />
          ),
        },
      ]}
    />
  )
}
