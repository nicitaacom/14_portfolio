import Link from "next/link"

import { FigmaUrlIcon } from "./FigmaUrlIcon"
import { GithubUrlIcon } from "./GithubUrlIcon"
import { YoutubeUrlIcon } from "./YouTubeUrlIcon"
import { Button } from "../Button"

interface ProjectProps {
  figmaUrl?: string
  youtubeUrl?: string
  githubUrl?: string
  youTubeEmbedPreview?: string
  siteUrl: string
  stack: string
  date: string // this is string - not ISO
  openMoreInfoModal: () => void
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
}: ProjectProps) {
  return (
    <div className="relative w-full tablet:h-[720px] h-[784px]">
      <div className="absolute top-sm right-sm flex gap-x-md">
        {figmaUrl && <FigmaUrlIcon figmaUrl={figmaUrl} />}
        {githubUrl && <GithubUrlIcon githubUrl={githubUrl} />}
        {youtubeUrl && <YoutubeUrlIcon youTubeUrl={youtubeUrl} />}
      </div>
      <div className="w-full h-[640px] border-[1px] border-solid border-secondary rounded-t-md overflow-hidden">
        {youTubeEmbedPreview ? (
          <iframe
            width="100%"
            height="100%"
            src={youTubeEmbedPreview}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen></iframe>
        ) : (
          <iframe className="w-full h-full" src={siteUrl} loading="lazy" />
        )}
      </div>
      {/* Footer */}
      <div
        className="w-full h-[144px] tablet:h-[80px] relative flex flex-col tablet:flex-row justify-between items-center 
          border-r-[1px] border-l-[1px] border-b-[1px] border-solid border-secondary rounded-b-md px-md py-md">
        <div className="w-full flex flex-col">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm block">
            Stack: <span>{stack}</span>
          </p>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm block">
            Date: <span>{date}</span>
          </p>
          <p className="flex flex-row">
            Demo:&nbsp;
            <Link className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-info block" href={siteUrl}>
              {siteUrl.split("?")[0]}
            </Link>
          </p>
        </div>

        <Button className="w-full tablet:w-fit whitespace-nowrap" onClick={openMoreInfoModal}>
          More info
        </Button>
      </div>
    </div>
  )
}
