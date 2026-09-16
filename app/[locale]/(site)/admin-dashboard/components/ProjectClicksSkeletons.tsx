function SummarySkeletonCard() {
  return (
    <div className="rounded-[2px] border border-brass/40 bg-steel px-xs py-xs">
      <div className="flex items-center gap-xs">
        <div className="h-[8px] w-[8px] animate-pulse rounded-full bg-[var(--3d-dot-c-4a4a4a)]" />
        <div className="h-[10px] w-[88px] animate-pulse rounded bg-steel" />
      </div>
      <div className="mt-xs h-[24px] w-[132px] animate-pulse rounded bg-steel" />
      <div className="mt-xs h-[10px] w-[110px] animate-pulse rounded bg-steel" />
    </div>
  )
}

export function ProjectClicksSummarySkeletonRow() {
  return (
    <div className="grid grid-cols-1 gap-xs tablet:grid-cols-2 laptop:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SummarySkeletonCard key={index} />
      ))}
    </div>
  )
}

export function ProjectClicksLineChartSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <div className="grid gap-xs rounded-[2px] border border-brass/40 bg-steel p-xs tablet:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-xs">
          <div className="h-[10px] w-[112px] animate-pulse rounded bg-steel" />
          <div className="flex items-end gap-xs">
            <div className="h-[22px] w-[184px] animate-pulse rounded bg-steel" />
            <div className="h-[30px] w-[72px] animate-pulse rounded bg-steel" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-xs">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rounded-[2px] border border-brass/40 bg-steel px-xs py-xs" key={index}>
              <div className="h-[9px] w-[40px] animate-pulse rounded bg-steel" />
              <div className="mt-xs h-[16px] w-[42px] animate-pulse rounded bg-steel" />
              <div className="mt-xs h-[9px] w-[32px] animate-pulse rounded bg-steel" />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-xs">
        <div className="flex min-w-[920px] flex-col gap-sm rounded-[2px] border border-brass/40 bg-steel px-xs py-xs">
          {[1, 2, 3].map(item => (
            <div className="h-px w-full border-t border-dashed border-brass/40" key={item} />
          ))}

          <div className="relative h-[184px]">
            <div className="absolute bottom-[32px] left-[16px] right-[52px] h-[3px] rounded-full bg-steel" />
            <div className="absolute bottom-[26px] left-[16px] right-[52px] flex items-center justify-between">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  className="h-[8px] w-[8px] animate-pulse rounded-full border-[2px] border-brass/40 bg-steel"
                  key={index}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-xs">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-[10px] w-[38px] animate-pulse rounded bg-steel" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AllProjectsClicksBarChartSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <div className="grid gap-xs tablet:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded-[2px] border border-brass/40 bg-steel px-xs py-xs" key={index}>
            <div className="h-[10px] w-[78px] animate-pulse rounded bg-steel" />
            <div className="mt-xs h-[20px] w-[52px] animate-pulse rounded bg-steel" />
          </div>
        ))}
      </div>

      <div className="max-w-full overflow-x-auto pb-xs">
        <div className="flex min-w-[760px] flex-col gap-xs">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="rounded-[2px] border border-brass/40 bg-steel px-xs py-xs" key={index}>
              <div className="flex items-center gap-xs">
                <div className="h-[28px] w-[28px] animate-pulse rounded-full bg-steel" />
                <div className="w-[160px]">
                  <div className="h-[14px] w-[96px] animate-pulse rounded bg-steel" />
                  <div className="mt-xs h-[10px] w-[52px] animate-pulse rounded bg-steel" />
                </div>
                <div className="h-[12px] flex-1 animate-pulse rounded-full bg-steel" />
                <div className="h-[18px] w-[52px] animate-pulse rounded bg-steel" />
              </div>
              <div className="mt-xs flex flex-wrap gap-xs pl-md">
                {Array.from({ length: 4 }).map((__, chipIndex) => (
                  <div className="h-[20px] w-[70px] animate-pulse rounded-full bg-steel" key={chipIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
