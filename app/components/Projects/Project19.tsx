import { Project } from "../Project/Project"

export default function Project19({ openModal }: { openModal: () => void }) {
  return (
    <Project
      openMoreInfoModal={openModal}
      stack="Next, TypeScript, Tailwind, Supabase, Zustand, Stripe"
      date="05.2023 - 05.2023 (~50h)"
      siteUrl="https://19-spotify-clone.vercel.app/"
      githubUrl="https://github.com/nicitaacom/19_spotify-clone/tree/development/app"
      youtubeUrl="https://youtube.com/watch?v=2aeMRB8LL4o"
    />
  )
}
