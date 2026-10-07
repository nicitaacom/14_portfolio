"use client"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"

export default function ModalMoreInfo16() {
  const project = trackedProjectsMap["project-16-gericht-restaurant"]

  const t = useScopedI18n("projectModal")

  return (
    <ModalMoreInfo
      modalQuery="16MoreInfo"
      label="16_gericht-restaurant"
      siteUrl="https://16-gericht-restaurant.vercel.app"
      taskLabel={t("project16Task")}
      stack={project.stack}
      deadline="1 month"
      collaborators={[
        {
          name: "Kilomebit17",
          imgSrc: "/collaborations/16_gericht-restaurant/Kilomebit17.png",
          collaboratorUrl: "https://github.com/Kilomebit17",
          description: t("project16CollaborationLead"),
        },
        { description: t("wholeSite") },
      ]}
    />
  )
}
