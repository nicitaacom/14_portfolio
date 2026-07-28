"use client"

import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { useScopedI18n } from "@/locales/client"
import { NDAProjectPreview } from "./NDAProjectPreview"
import { projectStacks } from "@/data/projectStacks"

export default function ProjectNDA({ openModal }: { openModal: () => void }) {
  const t = useScopedI18n("ndaProject.card")
  const project = trackedProjectsMap["project-nda-outreach-platform"]

  return (
    <Project
      openMoreInfoModal={openModal}
      preview={<NDAProjectPreview />}
      stack={projectStacks.projectNda}
      stackCharacterLimit={40}
      date={t("confidentialEngagement")}
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
