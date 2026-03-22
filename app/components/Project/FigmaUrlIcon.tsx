import Image from "next/image"
import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"
import { TrackedProjectLink } from "./TrackedProjectLink"

interface Props {
  figmaUrl: string
  projectGroup: TTrackedProjectGroup
  projectName: string
  projectSlug: string
}

export function FigmaUrlIcon({ figmaUrl, projectGroup, projectName, projectSlug }: Props) {
  return (
    <TrackedProjectLink
      className=" w-[48px] h-[48px] rounded-[50%] bg-primary-foreground cursor-pointer hidden desktop:flex"
      href={figmaUrl}
      linkType="figma"
      projectGroup={projectGroup}
      projectName={projectName}
      projectSlug={projectSlug}>
      <div className="relative w-[48px] h-[48px]">
        <Image
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[32px] h-[32px]"
          src="/figma.png"
          alt="figma"
          width={32}
          height={32}
        />
      </div>
    </TrackedProjectLink>
  )
}
