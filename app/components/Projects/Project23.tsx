import MoreInfoButton23 from "./Buttons/ButtonMoreInfo23"
import { Project } from "../Project/Project"

export default function Project23() {
  return (
    <Project
      title="23_store"
      subTitle="Whole site"
      leftInfo={
        <>
          Next + TypeScript + Tailwind + zustand + stripe + paypal
          <br />
          Responsive
          <br />
          09.2023 - 11.2023 (~670h)
        </>
      }
      moreInfoButton={MoreInfoButton23}
      siteUrl="https://23-store.vercel.app/?utm_source=nicitaa.com"
      githubUrl="https://github.com/nicitaacom/23_store"
      youtubeUrl="https://streamable.com/1zdhl7"
    />
  )
}
