import { Project } from "../../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { projectStacks } from "@/data/projectStacks"

export default function Project20({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-20-flowmazon-clone"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={projectStacks.project20}
      stackCharacterLimit={40}
      date="09.2023 - 09.2023 (~7h)"
      siteUrl="https://20-flowmazon-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/20_flowmazon-clone/tree/development/src/app"
      youtubeUrl="https://www.youtube.com/watch?v=AaiijESQH5o"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
