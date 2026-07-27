"use client"

import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { NDAContributionDetails, NDANotice } from "@/components/Projects/NDAContributionDetails"
import { useScopedI18n } from "@/locales/client"
import { useModalsStore } from "@/store/modalsStore"
import webAvatar from "../../../../public/collaborations/web-avatar.jpg"

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
      collaborators={[
        {
          name: "nicitaacom",
          imgSrc: webAvatar.src,
          description: <NDAContributionDetails />,
        },
      ]}
    />
  )
}
