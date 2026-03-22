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
      className="w-[48px] h-[48px] rounded-[50%] bg-primary-foreground cursor-pointer hidden desktop:flex"
      href={githubUrl}
      linkType="github"
      projectGroup={projectGroup}
      projectName={projectName}
      projectSlug={projectSlug}>
      <div className="relative">
        <AiFillGithub className="text-secondary-foreground" size={48} />
      </div>
    </TrackedProjectLink>
  )
}
