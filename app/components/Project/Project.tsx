import { FunctionComponent, ReactElement } from "react"
import Link from "next/link"

import { FigmaUrlIcon } from "./FigmaUrlIcon"
import { GithubUrlIcon } from "./GithubUrlIcon"
import { YoutubeUrlIcon } from "./YouTubeUrlIcon"

interface ProjectProps {
  figmaUrl?: string
  youtubeUrl?: string
  githubUrl?: string
  youTubeEmbedPreview?: string
  siteUrl: string
  stack: string
  date: string // this is string - not ISO
  moreInfoButton: FunctionComponent
}

export function Project({
  figmaUrl,
  youtubeUrl,
  githubUrl,
  siteUrl,
  youTubeEmbedPreview,
  stack,
  date,
  moreInfoButton: MoreInfoButton,
}: ProjectProps) {
  return (
    <div className="relative w-full h-[720px]">
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
        className="relative flex justify-end desktop:justify-between items-center 
          border-r-[1px] border-l-[1px] border-b-[1px] border-solid border-secondary rounded-b-md px-md h-[80px]">
        <div className="flex flex-col">
          <p>
            Stack: <span>{stack}</span>
          </p>
          <p>
            Date: <span>{date}</span>
          </p>
          <p>
            Demo:&nbsp;
            <Link className="text-sm text-info" href={siteUrl}>
              {siteUrl.split("?")[0]}
            </Link>
          </p>
        </div>

        <MoreInfoButton />
      </div>
    </div>
  )
}
