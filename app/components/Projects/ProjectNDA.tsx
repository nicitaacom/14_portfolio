"use client"

import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { useScopedI18n } from "@/locales/client"
import { NDAProjectPreview } from "./NDAProjectPreview"

export default function ProjectNDA({ openModal }: { openModal: () => void }) {
  const t = useScopedI18n("ndaProject.card")
  const project = trackedProjectsMap["project-nda-outreach-platform"]

  return (
    <Project
      openMoreInfoModal={openModal}
      preview={<NDAProjectPreview />}
      stack="Next.js, AWS, Redis, Supabase, Cloudflare, Docker"
      date={t("confidentialEngagement")}
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
