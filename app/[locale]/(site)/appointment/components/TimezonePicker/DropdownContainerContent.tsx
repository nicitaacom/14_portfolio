import Image from "next/image"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"

export function DropdownContainerContent() {
  const { selectedTimezone } = useSelectedTimezoneStore()
  return (
    <div className="flex w-full items-center justify-between gap-xs">
      <span className="truncate text-sm text-secondary">{selectedTimezone}</span>
      <Image className="h-[16px] w-[16px]" src="/tringle.png" alt="tringle" width={16} height={16} />
    </div>
  )
}
