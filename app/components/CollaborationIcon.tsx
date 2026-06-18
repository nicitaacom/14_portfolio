import Image from "next/image"
import { ReactElement } from "react"

interface CollaborationIconIconProps {
  tooltiptext: string | ReactElement
  profileUrl?: string
  imgSrc?: string
}

export function CollaborationIcon({ tooltiptext, profileUrl, imgSrc }: CollaborationIconIconProps) {
  return (
    <div className="tooltip-modal collaboration-tooltip">
      <Image
        className="cursor-pointer w-[48px] h-[48px] rounded-[50%]"
        onClick={() => window.open(profileUrl ? profileUrl : "https://github.com/nicitaacom")}
        src={imgSrc ? imgSrc : "/web-avatar.jpg"}
        alt="collaboration"
        width={32}
        height={32}
      />
      <div className="tooltiptext-modal">
        <h1>{tooltiptext}</h1>
      </div>
    </div>
  )
}
