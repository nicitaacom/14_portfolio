import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function Project23({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-23-store"]

  return (
    <Project
      stack={project.stack}
      stackCharacterLimit={40}
      date="09.2023 (~780h)"
      openMoreInfoModal={openModal}
      siteUrl="https://www.jokik.fi/?utm_source=nicitaa.com"
      githubUrl="https://github.com/nicitaacom/23_store"
      // no figma url cuz I was creating design "in moment" without figma
      youtubeUrl="https://www.youtube.com/watch?v=xZ1DOfFfpc8&feature=youtu.be"
      youTubeEmbedPreview="https://www.youtube.com/embed/xZ1DOfFfpc8"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
