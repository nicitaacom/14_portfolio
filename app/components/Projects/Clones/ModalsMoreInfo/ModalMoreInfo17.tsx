"use client"

import { trackedProjectsMap } from "@/data/repos"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo17() {
  const project = trackedProjectsMap["project-17-messenger-clone"]

  return (
    <ModalMoreInfo
      modalQuery="17MoreInfo"
      label="17_messenger-clone"
      siteUrl="https://github.com/nicitaacom/17_messenger-clone"
      taskLabel="Build some clone to improve skills"
      stack={project.stack}
      deadline="no deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
