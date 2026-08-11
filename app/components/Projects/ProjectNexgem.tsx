"use client"

import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/repos"
import { useScopedI18n } from "@/locales/client"
import { NexgemProjectPreview } from "./NexgemProjectPreview"

export default function ProjectNexgem({ openModal }: { openModal: () => void }) {
  const t = useScopedI18n("nexgemProject.card")
  const project = trackedProjectsMap["project-nexgem-automation-platform"]

  return (
    <Project
      openMoreInfoModal={openModal}
      preview={<NexgemProjectPreview />}
      stack={project.stack}
      stackCharacterLimit={40}
      date={t("engagement")}
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
