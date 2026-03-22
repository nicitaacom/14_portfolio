function SummarySkeletonCard() {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <div className="h-[10px] w-[86px] animate-pulse rounded bg-[#313131]" />
      <div className="mt-[10px] h-[22px] w-[132px] animate-pulse rounded bg-[#3a3a3a]" />
    </div>
  )
}

export function ProjectClicksSummarySkeletonRow() {
  return (
    <div className="grid grid-cols-2 gap-[4px] laptop:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SummarySkeletonCard key={index} />
      ))}
    </div>
  )
}

export function ProjectClicksLineChartSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="flex items-start justify-between gap-sm">
        <div className="flex flex-col gap-[6px]">
          <div className="h-[20px] w-[190px] animate-pulse rounded bg-[#333333]" />
          <div className="h-[12px] w-[112px] animate-pulse rounded bg-[#2c2c2c]" />
        </div>

        <div className="rounded-[8px] border border-[#363636] bg-[#1f1f1f] px-sm py-xs">
          <div className="h-[9px] w-[42px] animate-pulse rounded bg-[#2f2f2f]" />
          <div className="mt-[8px] h-[18px] w-[64px] animate-pulse rounded bg-[#3a3a3a]" />
        </div>
      </div>

      <div className="overflow-x-auto pb-[4px]">
        <div className="flex min-w-[760px] flex-col gap-[18px] rounded-[8px] border border-[#343434] bg-[#1d1d1d] px-sm py-sm">
          {[1, 2, 3].map(item => (
            <div className="h-px w-full border-t border-dashed border-[#313131]" key={item} />
          ))}

          <div className="relative h-[150px]">
            <div className="absolute bottom-[28px] left-[16px] right-[16px] h-[3px] rounded-full bg-[#3b3b3b]" />
            <div className="absolute bottom-[22px] left-[16px] right-[16px] flex items-center justify-between">
              {Array.from({ length: 12 }).map((_, index) => (
                <div className="h-[10px] w-[10px] animate-pulse rounded-full border-[2px] border-[#6d86ff] bg-[#1d1d1d]" key={index} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-[6px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-[10px] w-[38px] animate-pulse rounded bg-[#2d2d2d]" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AllProjectsClicksBarChartSkeleton() {
  return (
    <div className="max-w-full overflow-x-auto pb-[4px]">
      <div className="flex min-w-[720px] items-end gap-xs">
        {[36, 78, 58, 34, 44, 62, 48, 54, 72, 51, 68, 39].map((height, index) => (
          <div className="flex min-w-[56px] flex-1 flex-col items-center gap-[6px]" key={`${height}-${index}`}>
            <div className="h-[10px] w-[16px] animate-pulse rounded bg-[#2d2d2d]" />
            <div className="flex h-[180px] w-full items-end justify-center rounded-[8px] border border-[#343434] bg-[#1d1d1d] px-[6px] py-[6px]">
              <div className="w-full animate-pulse rounded-[6px] bg-[#3047a8]" style={{ height: `${height}%` }} />
            </div>
            <div className="h-[10px] w-[42px] animate-pulse rounded bg-[#2d2d2d]" />
          </div>
        ))}
      </div>
    </div>
  )
}
