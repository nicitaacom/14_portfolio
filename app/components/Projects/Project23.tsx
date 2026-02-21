import { Project } from "../Project/Project"

export default function Project23({ openModal }: { openModal: () => void }) {
  return (
    <Project
      stack="Next, TypeScript, Tailwind, Zustand, Stripe, Telegram API"
      date="09.2023 - 11.2023 (~670h)"
      openMoreInfoModal={openModal}
      siteUrl="https://www.jokik.fi/?utm_source=nicitaa.com"
      githubUrl="https://github.com/nicitaacom/23_store"
      youtubeUrl="https://streamable.com/1zdhl7"
    />
  )
}
