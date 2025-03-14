import { Project } from "../Project/Project"

export default function Project17({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="Next, TypeScript, Tailwind, Prisma, Pusher"
      date="10.2023 - 10.2023 (~40h)"
      siteUrl="https://17-messenger-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/17_messenger-clone"
      youtubeUrl="https://www.youtube.com/watch?v=PGPGcKBpAk8"
    />
  )
}
