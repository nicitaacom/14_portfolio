"use client"

import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"
import { FigmaUrlIcon } from "./FigmaUrlIcon"
import { GithubUrlIcon } from "./GithubUrlIcon"
import { TrackedProjectLink } from "./TrackedProjectLink"
import { YoutubeUrlIcon } from "./YouTubeUrlIcon"
import { Button } from "../Button"
import { useScopedI18n } from "@/locales/client"

interface ProjectProps {
  figmaUrl?: string
  youtubeUrl?: string
  githubUrl?: string
  youTubeEmbedPreview?: string
  siteUrl: string
  stack: string
  date: string // this is string - not ISO
  openMoreInfoModal: () => void
  projectSlug: string
  projectName: string
  projectGroup: TTrackedProjectGroup
}

export function Project({
  figmaUrl,
  youtubeUrl,
  githubUrl,
  siteUrl,
  youTubeEmbedPreview,
  stack,
  date,
  openMoreInfoModal,
  projectSlug,
  projectName,
  projectGroup,
}: ProjectProps) {
  const t = useScopedI18n("common")
  const previewClassName = "group relative block w-full h-[640px] border-[1px] border-solid border-secondary rounded-t-md overflow-hidden"

  return (
    <div className="relative w-full tablet:h-[720px] h-[784px]">
      <div className="absolute top-sm right-sm flex gap-x-md">
        {figmaUrl && <FigmaUrlIcon figmaUrl={figmaUrl} projectGroup={projectGroup} projectName={projectName} projectSlug={projectSlug} />}
        {githubUrl && <GithubUrlIcon githubUrl={githubUrl} projectGroup={projectGroup} projectName={projectName} projectSlug={projectSlug} />}
        {youtubeUrl && <YoutubeUrlIcon youTubeUrl={youtubeUrl} projectGroup={projectGroup} projectName={projectName} projectSlug={projectSlug} />}
      </div>
      {youTubeEmbedPreview ? (
        <div className={previewClassName}>
          <iframe
            className="h-full w-full"
            width="100%"
            height="100%"
            src={youTubeEmbedPreview}
            loading="lazy"
            tabIndex={-1}
            title={`${projectName} preview`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen></iframe>
          <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5" />
        </div>
      ) : (
        <div className={previewClassName}>
          <iframe className="h-full w-full" src={siteUrl} loading="lazy" tabIndex={-1} title={`${projectName} preview`} />
          <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5" />
        </div>
      )}
      {/* Footer */}
      <div
        className="w-full h-[144px] tablet:h-[80px] relative flex flex-col tablet:flex-row justify-between items-center 
          border-r-[1px] border-l-[1px] border-b-[1px] border-solid border-secondary rounded-b-md px-md py-md">
        <div className="w-full flex flex-col">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm block">
            {t("stack")}: <span>{stack}</span>
          </p>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm block">
            {t("date")}: <span>{date}</span>
          </p>
          <p className="flex flex-row">
            {t("demo")}:&nbsp;
            <TrackedProjectLink
              className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-info block"
              href={siteUrl}
              linkType="demo"
              projectGroup={projectGroup}
              projectName={projectName}
              projectSlug={projectSlug}>
              {siteUrl.split("?")[0]}
            </TrackedProjectLink>
          </p>
        </div>

        <Button className="w-full tablet:w-fit whitespace-nowrap" onClick={openMoreInfoModal}>
          {t("moreInfo")}
        </Button>
      </div>
    </div>
  )
}
