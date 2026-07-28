import { FaFigma } from "react-icons/fa"
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
      className="plaque hidden h-[30px] w-[30px] cursor-pointer items-center justify-center desktop:flex"
      href={figmaUrl}
      linkType="figma"
      projectGroup={projectGroup}
      projectName={projectName}
      projectSlug={projectSlug}
      title="Open Figma design">
      <FaFigma aria-hidden="true" size={16} />
    </TrackedProjectLink>
  )
}
