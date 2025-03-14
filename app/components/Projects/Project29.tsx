import { Project } from "../Project/Project"

export default function Project29({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="Next, TypeScript, Tailwind"
      date="02.2023 - 03.2023 (~50h)"
      siteUrl="https://29-ai-companion.vercel.app/"
      githubUrl="https://github.com/nicitaacom/29_ai-companion"
      youtubeUrl="https://www.youtube.com/watch?v=PjYWpd7xkaM"
    />
  )
}
