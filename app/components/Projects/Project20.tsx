import { Project } from "../Project/Project"

export default function Project20({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="Next, TypeScript, Tailwind, daisyUI"
      date="09.2023 - 09.2023 (~7h)"
      siteUrl="https://20-flowmazon-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/20_flowmazon-clone/tree/development/src/app"
      youtubeUrl="https://www.youtube.com/watch?v=AaiijESQH5o"
    />
  )
}
