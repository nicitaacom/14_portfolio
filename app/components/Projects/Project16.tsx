import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function Project16({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-16-gericht-restaurant"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={project.stack}
      stackCharacterLimit={40}
      date="05.2023 - 31.07.2023 (~128h)"
      siteUrl="https://16-gericht-restaurant.vercel.app"
      githubUrl="https://github.com/Nicitaa/16_gericht-restaurant"
      figmaUrl="https://www.figma.com/file/at7kfXpaRagcwAwkkRVviz/Modern-UI%2FUX%3A-Gericht-(Copy)?type=design&node-id=0%3A1&mode=design&t=qbkbNwCPoXCSdZM4-1"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
