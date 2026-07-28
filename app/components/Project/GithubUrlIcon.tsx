import { AiFillGithub } from "react-icons/ai"
import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"
import { TrackedProjectLink } from "./TrackedProjectLink"

interface Props {
  githubUrl: string
  projectGroup: TTrackedProjectGroup
  projectName: string
  projectSlug: string
}

export function GithubUrlIcon({ githubUrl, projectGroup, projectName, projectSlug }: Props) {
  return (
    <TrackedProjectLink
      className="plaque hidden h-[30px] w-[30px] cursor-pointer items-center justify-center desktop:flex"
      href={githubUrl}
      linkType="github"
      projectGroup={projectGroup}
      projectName={projectName}
      projectSlug={projectSlug}
      title="Open GitHub repository">
      <AiFillGithub aria-hidden="true" size={17} />
    </TrackedProjectLink>
  )
}
