"use client"

import type { ReactNode } from "react"
import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"
import { FigmaUrlIcon } from "./FigmaUrlIcon"
import { GithubUrlIcon } from "./GithubUrlIcon"
import { TrackedProjectLink } from "./TrackedProjectLink"
import { YoutubeUrlIcon } from "./YouTubeUrlIcon"
import { Button } from "../Button"
import { useScopedI18n } from "@/locales/client"
import { limitProjectStack } from "@/utils/limitProjectStack"
import { HalloweenFrameOrnaments } from "@/components/Halloween/HalloweenFrameOrnaments"
import { HalloweenProjectSkull } from "@/components/Halloween/HalloweenProjectSkull"
import { NewYearProjectOrnament } from "@/components/NewYear/NewYearProjectOrnament"
import { NewYearProjectSnow } from "@/components/NewYear/NewYearProjectSnow"

interface ProjectProps {
  figmaUrl?: string
  youtubeUrl?: string
  githubUrl?: string
  youTubeEmbedPreview?: string
  preview?: ReactNode
  siteUrl?: string
  stack: string
  stackCharacterLimit: number
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
  preview,
  stack,
  stackCharacterLimit,
  date,
  openMoreInfoModal,
  projectSlug,
  projectName,
  projectGroup,
}: ProjectProps) {
  const t = useScopedI18n("common")
  const previewClassName = "machine-bezel border-0 group relative block h-full w-full overflow-hidden"

  return (
    <div className="site-card pipe-frame relative w-full tablet:h-[720px] h-[784px]">
      <HalloweenFrameOrnaments variant="project" />
      <HalloweenProjectSkull />
      <NewYearProjectOrnament />
      <div className="project-wood-body relative flex h-full min-h-0 flex-col gap-[7px]">
        <div className="project-header shrink-0">
          <span className="project-paper-tab truncate">{projectName}</span>
          <div className="flex gap-x-sm">
            {figmaUrl && (
              <FigmaUrlIcon
                figmaUrl={figmaUrl}
                projectGroup={projectGroup}
                projectName={projectName}
                projectSlug={projectSlug}
              />
            )}
            {githubUrl && (
              <GithubUrlIcon
                githubUrl={githubUrl}
                projectGroup={projectGroup}
                projectName={projectName}
                projectSlug={projectSlug}
              />
            )}
            {youtubeUrl && (
              <YoutubeUrlIcon
                youTubeUrl={youtubeUrl}
                projectGroup={projectGroup}
                projectName={projectName}
                projectSlug={projectSlug}
              />
            )}
          </div>
        </div>
        {preview ? (
          <div className="min-h-0 flex-1 px-[10px]">
            <div className={previewClassName}>{preview}</div>
          </div>
        ) : youTubeEmbedPreview ? (
          <div className="min-h-0 flex-1 px-[10px]">
            <div className={previewClassName}>
              <iframe
                className="h-full w-full"
                width="100%"
                height="100%"
                src={youTubeEmbedPreview}
                loading="lazy"
                tabIndex={-1}
                title={`${projectName} preview`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>
              <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5" />
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 px-[10px]">
            <div className={previewClassName}>
              <iframe
                className="h-full w-full"
                src={siteUrl}
                loading="lazy"
                tabIndex={-1}
                title={`${projectName} preview`}
              />
              <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5" />
            </div>
          </div>
        )}
        <div className="project-info-board relative flex shrink-0 flex-col items-center justify-between px-md py-md pb-[10px] tablet:h-[80px] tablet:flex-row">
          <div className="flex w-full flex-col">
            <p className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm">
              {t("stack")}: <span>{limitProjectStack(stack, stackCharacterLimit)}</span>
            </p>
            <p className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm">
              {t("date")}: <span>{date}</span>
            </p>
            {siteUrl && (
              <p className="flex flex-row">
                {t("demo")}:&nbsp;
                <TrackedProjectLink
                  className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-info"
                  href={siteUrl}
                  linkType="demo"
                  projectGroup={projectGroup}
                  projectName={projectName}
                  projectSlug={projectSlug}>
                  {siteUrl.split("?")[0]}
                </TrackedProjectLink>
              </p>
            )}
          </div>

          <Button className="w-full whitespace-nowrap tablet:w-fit" onClick={openMoreInfoModal}>
            {t("moreInfo")}
          </Button>
        </div>
      </div>
      <NewYearProjectSnow />
    </div>
  )
}
