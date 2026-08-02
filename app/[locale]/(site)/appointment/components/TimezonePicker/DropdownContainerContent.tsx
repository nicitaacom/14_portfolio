import Image from "next/image"
import { twMerge } from "tailwind-merge"
import { useAppointmentStore } from "@/store/useAppointmentStore"

export function DropdownContainerContent({
  isShowDropdown,
  toggleDropdown,
}: {
  isShowDropdown: boolean
  toggleDropdown: () => void
}) {
  const { selectedTimezone } = useAppointmentStore()
  return (
    <button
      type="button"
      className={twMerge(
        "appointment-picker-trigger flex h-[40px] w-full items-center justify-between gap-xs rounded-[10px] border border-brass/40 bg-steel px-sm text-left transition-colors duration-200",
        isShowDropdown && "border-cta/60 bg-cta/15",
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
