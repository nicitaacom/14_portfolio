import { Project } from "../Project/Project"

export default function Project22({ openModal }: { openModal: () => void }) {
  return (
    <Project
      stack="T3 Next App, TypeScript, Tailwind, CSS"
      date="19.06.2023 - 26.08.2023 (~101h)"
      openMoreInfoModal={openModal}
      siteUrl="https://22-aer-nicitaa.vercel.app/"
      githubUrl="https://github.com/Nicitaa/22_aer"
      figmaUrl="https://www.figma.com/file/llWyCvntsW1ZdIHgyVybUW/Untitled?type=design&node-id=0%3A1&t=iJdxmi7OnRcPZ8dg-1"
    />
  )
}
