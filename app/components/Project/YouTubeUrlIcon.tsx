import Image from "next/image"
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
      className=" w-[48px] h-[48px] rounded-[50%] bg-primary-foreground cursor-pointer hidden desktop:flex"
      href={youTubeUrl}
      linkType="youtube"
      projectGroup={projectGroup}
      projectName={projectName}
      projectSlug={projectSlug}>
      <div className="relative w-[48px] h-[48px]">
        <Image
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[48px] h-[48px]"
          src="/YouTube.png"
          alt="YouTube"
          width={128}
          height={128}
        />
      </div>
    </TrackedProjectLink>
  )
}
