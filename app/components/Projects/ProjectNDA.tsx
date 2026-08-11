"use client"

import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/repos"
import { NDAProjectPreview } from "./NDAProjectPreview"

export default function ProjectNDA({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-nda-outreach-platform"]

  return (
    <Project
      openMoreInfoModal={openModal}
      preview={<NDAProjectPreview />}
      stack={project.stack}
      stackCharacterLimit={40}
      date="04.2025"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
