"use client"

import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { useScopedI18n } from "@/locales/client"
import { NexgemProjectPreview } from "./NexgemProjectPreview"
import { projectStacks } from "@/data/projectStacks"

export default function ProjectNexgem({ openModal }: { openModal: () => void }) {
  const t = useScopedI18n("nexgemProject.card")
  const project = trackedProjectsMap["project-nexgem-automation-platform"]

  return (
    <Project
      openMoreInfoModal={openModal}
      preview={<NexgemProjectPreview />}
      stack={projectStacks.projectNexgem}
      stackCharacterLimit={40}
      date={t("engagement")}
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
