import Image from "next/image"

interface CollaborationIconProps {
  name?: string
  imgSrc?: string
  profileUrl?: string
  isSelected: boolean
  onClick: () => void
}

export function CollaborationIcon({
  name = "nicitaacom",
  imgSrc = "/collaborations/web-avatar.jpg",
  profileUrl,
  isSelected,
  onClick,
}: CollaborationIconProps) {
  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      className={`w-[42px] h-[42px] rounded-full shrink-0 transition-all duration-200 ${isSelected ? "ring-2 ring-secondary ring-offset-2 ring-offset-primary" : "opacity-60 hover:opacity-100"}`}>
      <Image
        className="w-[42px] h-[42px] rounded-full block"
        src={imgSrc}
        alt={name}
        width={64}
        height={64}
      />
    </button>
  )
}
