import { Project } from "../../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function Project17({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-17-messenger-clone"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={project.stack}
      stackCharacterLimit={40}
      date="10.2023 - 10.2023 (~40h)"
      siteUrl="https://17-messenger-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/17_messenger-clone"
      youtubeUrl="https://www.youtube.com/watch?v=PGPGcKBpAk8"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
