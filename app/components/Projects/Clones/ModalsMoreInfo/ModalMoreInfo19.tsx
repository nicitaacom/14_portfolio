"use client"

import { trackedProjectsMap } from "@/data/repos"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo19() {
  const project = trackedProjectsMap["project-19-spotify-clone"]

  return (
    <ModalMoreInfo
      modalQuery="19MoreInfo"
      label="19_spotify-clone"
      siteUrl="https://github.com/Nicitaa/15_HooBank"
      taskLabel="Improve FullStack developer skill"
      stack={project.stack}
      deadline="no deadline"
      collaborators={[{ description: "Whole site" }]}
    />
  )
}
