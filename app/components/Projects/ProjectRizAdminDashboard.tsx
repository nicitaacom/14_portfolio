import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/repos"

export default function ProjectRizAdminDashboard({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-riz-admin-dashboard"]

  return (
    <Project
      openMoreInfoModal={openModal}
      stack={project.stack}
      stackCharacterLimit={40}
      date="04.2023 - 04.2023 (~40h)"
      figmaUrl="https://www.figma.com/file/gEIGnyBftjDqfN9WhPaSea/Figma-riz?type=design&node-id=1669-162202&mode=design"
      youTubeEmbedPreview="https://www.youtube.com/embed/KLvM504OI9M?si=hdWxg2c3HRDAxOC7"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
