import { Project } from "../Project/Project"

export default function Project28({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="React, Next, TypeScript, Convex"
      date="10.2023 - 10.2023 (~14h)"
      siteUrl="https://28-jotion-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/28_notion-clone"
      youtubeUrl="https://www.youtube.com/watch?v=0OaDyjB9Ib8"
    />
  )
}
