"use client"

import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { NDAProjectPreview } from "./NDAProjectPreview"
import { projectStacks } from "@/data/projectStacks"

export default function ProjectNDA({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-nda-outreach-platform"]

  return (
    <Project
      openMoreInfoModal={openModal}
      preview={<NDAProjectPreview />}
      stack={projectStacks.projectNda}
      stackCharacterLimit={40}
      date="04.2025"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
