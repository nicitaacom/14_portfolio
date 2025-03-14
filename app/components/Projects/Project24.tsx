import { Project } from "../Project/Project"

export default function Project22({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="React, Vite, TypeScript, MUI"
      date="07.2023 - 08.2023 (~30h)"
      siteUrl="https://24-dashboard-mui.vercel.app"
      githubUrl="https://github.com/Nicitaa/24_dashboard-mui"
      figmaUrl="https://www.figma.com/file/ugi51UXz9ehKvXR1CSz1CJ/Purity-UI-Dashboard---Chakra-UI-Dashboard-(Community)?type=design&node-id=1516-368&mode=design&t=4eHHT6vtEqZZq67S-0"
    />
  )
}
