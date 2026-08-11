import { Project } from "../../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function Project19({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-19-spotify-clone"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={project.stack}
      stackCharacterLimit={40}
      date="05.2023 - 05.2023 (~50h)"
      siteUrl="https://spotify-clone.nicitaa.com?is_iframe=true"
      githubUrl="https://github.com/nicitaacom/19_spotify-clone/tree/development/app"
      youtubeUrl="https://youtube.com/watch?v=2aeMRB8LL4o"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
