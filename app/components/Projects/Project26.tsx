import { Project } from "../Project/Project"

export default function Project26({ openModal }: { openModal: () => void }) {
  return (
    <Project
      stack="Next, TypeScript, Tailwind, Supabase, OpenAI, AWS, GCP"
      date="11.2023 - 01.2023 (~643h)"
      openMoreInfoModal={openModal}
      siteUrl="https://26-hot-delivery.vercel.app//?utm_source=portfolio&utm_medium=website&utm_campaign=personal_portfolio&utm_content=homepage"
      figmaUrl="https://www.figma.com/file/naTRYx4iTl8QhsEM584Nvv/26_hot-delivery?type=design&node-id=136-97&mode=design&t=mbTnMKHyu81vCueg-0"
      youTubeEmbedPreview="https://www.youtube.com/embed/7WX6zA8qgp4?si=8zNxCVLensQBIRbJ"
    />
  )
}
