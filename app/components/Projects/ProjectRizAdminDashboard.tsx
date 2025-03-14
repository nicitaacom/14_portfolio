import { Project } from "../Project/Project"

export default function ProjectRizAdminDashboard({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="Next, TypeScript, Tailwind, MongoDB"
      date="04.2023 - 04.2023 (~40h)"
      siteUrl="https://admin.waka.cool/not-deployed"
      figmaUrl="https://www.figma.com/file/gEIGnyBftjDqfN9WhPaSea/Figma-riz?type=design&node-id=1669-162202&mode=design"
      youTubeEmbedPreview="https://www.youtube.com/embed/KLvM504OI9M?si=hdWxg2c3HRDAxOC7"
    />
  )
}
