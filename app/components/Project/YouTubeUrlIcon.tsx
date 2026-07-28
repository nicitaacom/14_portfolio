import { FaYoutube } from "react-icons/fa6"
import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"
import { TrackedProjectLink } from "./TrackedProjectLink"

interface Props {
  youTubeUrl: string
  projectGroup: TTrackedProjectGroup
  projectName: string
  projectSlug: string
}

export function YoutubeUrlIcon({ youTubeUrl, projectGroup, projectName, projectSlug }: Props) {
  return (
    <TrackedProjectLink
      className="plaque hidden h-[30px] w-[30px] cursor-pointer items-center justify-center desktop:flex"
      href={youTubeUrl}
      linkType="youtube"
      projectGroup={projectGroup}
      projectName={projectName}
      projectSlug={projectSlug}
      title="Open YouTube video">
      <FaYoutube aria-hidden="true" size={17} />
    </TrackedProjectLink>
  )
}
