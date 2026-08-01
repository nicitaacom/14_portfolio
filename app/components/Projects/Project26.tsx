import { Project } from "../Project/Project"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { projectStacks } from "@/data/projectStacks"

export default function Project26({ openModal }: { openModal: () => void }) {
  const project = trackedProjectsMap["project-26-hot-delivery"]

  return (
    <Project
      stack={projectStacks.project26}
      stackCharacterLimit={40}
      date="11.2023 - 01.2024 (~693h)"
      openMoreInfoModal={openModal}
      siteUrl="https://26-hot-delivery.vercel.app/?utm_source=portfolio&utm_medium=website&utm_campaign=personal_portfolio&utm_content=homepage"
      // no github url cuz I decided to keep it closed source
      youtubeUrl="https://youtu.be/7WX6zA8qgp4"
      figmaUrl="https://www.figma.com/file/naTRYx4iTl8QhsEM584Nvv/26_hot-delivery?type=design&node-id=136-97&mode=design&t=mbTnMKHyu81vCueg-0"
      youTubeEmbedPreview="https://www.youtube.com/embed/7WX6zA8qgp4?si=8zNxCVLensQBIRbJ"
      projectSlug={project.slug}
      projectName={project.name}
      projectGroup={project.group}
    />
  )
}
