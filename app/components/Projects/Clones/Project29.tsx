import { Project } from "../../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { projectStacks } from "@/data/projectStacks"

export default function Project29({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-29-ai-companion"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={projectStacks.project29}
      stackCharacterLimit={40}
      date="02.2023 - 03.2023 (~50h)"
      siteUrl="https://29-ai-companion.vercel.app/"
      githubUrl="https://github.com/nicitaacom/29_ai-companion"
      youtubeUrl="https://www.youtube.com/watch?v=PjYWpd7xkaM"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
