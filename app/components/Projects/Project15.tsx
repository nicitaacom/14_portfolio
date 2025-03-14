import { Project } from "../Project/Project"

export default function Project15({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="React, Vite, TypeScript, Tailwind"
      date="05.2023 - 05.2023 (~50h)"
      siteUrl="https://15-hoo-bank.vercel.app"
      githubUrl="https://github.com/Nicitaa/15_HooBank"
      figmaUrl="https://www.figma.com/file/QRQCYjU0PxVyMJW2MjZ50p/HooBank-(Copy)?type=design&node-id=0%3A1&mode=design&t=jJPu1kzoLGIwvFKk-1"
    />
  )
}
