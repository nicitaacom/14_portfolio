import Image from "next/image"

interface CollaborationIconProps {
  name?: string
  imgSrc?: string
  isSelected: boolean
  onClick: () => void
}

export function CollaborationIcon({
  name = "nicitaacom",
  imgSrc = "/collaborations/web-avatar.jpg",
  isSelected,
  onClick,
}: CollaborationIconProps) {
  return (
    <button
      type="button"
      title={name}
      aria-pressed={isSelected}
      onClick={onClick}
      className={`flex w-full min-w-0 items-center gap-x-sm px-sm py-sm text-left transition-colors duration-200 ${
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
      <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold">
        {name}
      </span>
    </button>
  )
}
