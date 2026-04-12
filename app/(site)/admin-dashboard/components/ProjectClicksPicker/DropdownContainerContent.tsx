import Image from "next/image"
import { twMerge } from "tailwind-merge"

interface DropdownContainerContentProps {
  isShowDropdown: boolean
  selectedProjectName: string
}

export function DropdownContainerContent({ isShowDropdown, selectedProjectName }: DropdownContainerContentProps) {
  return (
    <div className="flex w-full items-center justify-between gap-xs">
      <span className="truncate text-sm text-secondary">{selectedProjectName}</span>
      <Image
        className={twMerge("h-[16px] w-[16px] transition-transform duration-200", isShowDropdown && "rotate-180")}
        src="/tringle.png"
        alt="Dropdown arrow"
        width={16}
        height={16}
      />
    </div>
  )
}
