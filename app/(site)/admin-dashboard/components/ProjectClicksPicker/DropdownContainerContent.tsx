import Image from "next/image"

export function DropdownContainerContent({ selectedProjectName }: { selectedProjectName: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-xs">
      <span className="truncate text-sm text-secondary">{selectedProjectName}</span>
      <Image className="h-[16px] w-[16px]" src="/tringle.png" alt="tringle" width={16} height={16} />
    </div>
  )
}
