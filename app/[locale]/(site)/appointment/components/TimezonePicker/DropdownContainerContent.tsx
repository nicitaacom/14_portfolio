import Image from "next/image"
import { twMerge } from "tailwind-merge"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"

export function DropdownContainerContent({
  isShowDropdown,
  toggleDropdown,
}: {
  isShowDropdown: boolean
  toggleDropdown: () => void
}) {
  const { selectedTimezone } = useSelectedTimezoneStore()
  return (
    <button
      type="button"
      className={twMerge(
        "flex h-[40px] w-full items-center justify-between gap-xs rounded-[10px] border border-[#555555] bg-[#242424] px-sm text-left transition-colors duration-200",
        isShowDropdown && "border-cta/60 bg-[#28222e]",
      )}
      onClick={toggleDropdown}>
      <span className="truncate text-sm font-medium text-secondary">{selectedTimezone}</span>
      <Image
        className={twMerge(
          "h-[14px] w-[14px] shrink-0 transition-transform duration-200",
          isShowDropdown && "rotate-180",
        )}
        src="/tringle.png"
        alt="Dropdown arrow"
        width={18}
        height={18}
      />
    </button>
  )
}
