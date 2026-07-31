import Image from "next/image"
import { FiExternalLink } from "react-icons/fi"

interface CollaborationIconProps {
  name?: string
  imgSrc?: string
  collaboratorUrl?: string
  isSelected: boolean
  onClick: () => void
}

export function CollaborationIcon({
  name = "nicitaacom",
  imgSrc = "/collaborations/web-avatar.jpg",
  collaboratorUrl = "https://github.com/nicitaacom/",
  isSelected,
  onClick,
}: CollaborationIconProps) {
  return (
    <a
      href={collaboratorUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      aria-current={isSelected ? "true" : undefined}
      onClick={onClick}
      className={`collaboration-card group flex w-full min-w-0 items-center gap-x-sm px-sm py-sm text-left transition-colors duration-200 ${
        isSelected
          ? "bg-secondary-foreground/[0.06]"
          : "opacity-60 hover:bg-secondary-foreground/[0.035] hover:opacity-100"
      }`}>
      <Image
        className="block h-10 w-10 shrink-0 rounded-full object-cover"
        src={imgSrc}
        alt={name}
        width={40}
        height={40}
      />
      <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold transition-colors duration-200 group-hover:text-white">
        {name}
      </span>
      <FiExternalLink
        className="ml-auto shrink-0 text-secondary-foreground/45 transition-colors duration-200 group-hover:text-cta"
        size={12}
        aria-hidden="true"
      />
    </a>
  )
}
