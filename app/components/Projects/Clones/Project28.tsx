import { Project } from "../../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function Project28({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-28-notion-clone"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={project.stack}
      stackCharacterLimit={40}
      date="10.2023 - 10.2023 (~14h)"
      siteUrl="https://28-jotion-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/28_notion-clone"
      youtubeUrl="https://www.youtube.com/watch?v=0OaDyjB9Ib8"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
