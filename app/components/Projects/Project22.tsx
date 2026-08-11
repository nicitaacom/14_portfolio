import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function Project22({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-22-aer"]

  return (
    <Project
      stack={project.stack}
      stackCharacterLimit={40}
      date="19.06.2023 - 26.08.2023 (~101h)"
      openMoreInfoModal={openModal}
      siteUrl="https://22-aer-nicitaa.vercel.app/"
      githubUrl="https://github.com/Nicitaa/22_aer"
      figmaUrl="https://www.figma.com/file/llWyCvntsW1ZdIHgyVybUW/Untitled?type=design&node-id=0%3A1&t=iJdxmi7OnRcPZ8dg-1"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
