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
        "flex h-[46px] w-full items-center justify-between gap-sm rounded-[12px] border border-[#777777] bg-[#202020]/90 px-md text-left shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors duration-200",
        isShowDropdown && "border-cta/70 bg-[#262626]",
      )}
      onClick={toggleDropdown}>
      <span className="truncate text-sm text-secondary">{selectedTimezone}</span>
      <Image
        className={twMerge("h-[16px] w-[16px] shrink-0 transition-transform duration-200", isShowDropdown && "rotate-180")}
        src="/tringle.png"
        alt="Dropdown arrow"
        width={16}
        height={16}
      />
    </button>
  )
}
