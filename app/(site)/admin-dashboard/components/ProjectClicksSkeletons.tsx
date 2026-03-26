function SummarySkeletonCard() {
  return (
    <div className="rounded-[16px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm">
      <div className="flex items-center gap-[8px]">
        <div className="h-[8px] w-[8px] animate-pulse rounded-full bg-[#35548c]" />
        <div className="h-[10px] w-[88px] animate-pulse rounded bg-[#24324d]" />
      </div>
      <div className="mt-[12px] h-[24px] w-[132px] animate-pulse rounded bg-[#1d2940]" />
      <div className="mt-[8px] h-[10px] w-[110px] animate-pulse rounded bg-[#162033]" />
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
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="grid gap-xs rounded-[16px] border border-[#1d2738] bg-[#0f1728] p-sm tablet:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-[8px]">
          <div className="h-[10px] w-[112px] animate-pulse rounded bg-[#25334d]" />
          <div className="flex items-end gap-sm">
            <div className="h-[22px] w-[184px] animate-pulse rounded bg-[#1d2940]" />
            <div className="h-[30px] w-[72px] animate-pulse rounded bg-[#162033]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-xs">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rounded-[12px] border border-[#1c2940] bg-[#101829] px-sm py-[10px]" key={index}>
              <div className="h-[9px] w-[40px] animate-pulse rounded bg-[#25334d]" />
              <div className="mt-[8px] h-[16px] w-[42px] animate-pulse rounded bg-[#1d2940]" />
              <div className="mt-[6px] h-[9px] w-[32px] animate-pulse rounded bg-[#162033]" />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-[4px]">
        <div className="flex min-w-[920px] flex-col gap-[18px] rounded-[18px] border border-[#1d2738] bg-[#0b1120] px-sm py-sm">
          {[1, 2, 3].map(item => (
            <div className="h-px w-full border-t border-dashed border-[#24324d]" key={item} />
          ))}

          <div className="relative h-[184px]">
            <div className="absolute bottom-[32px] left-[16px] right-[52px] h-[3px] rounded-full bg-[#1d2940]" />
            <div className="absolute bottom-[26px] left-[16px] right-[52px] flex items-center justify-between">
              {Array.from({ length: 12 }).map((_, index) => (
                <div className="h-[8px] w-[8px] animate-pulse rounded-full border-[2px] border-[#5da8ff] bg-[#0b1120]" key={index} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-[6px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-[10px] w-[38px] animate-pulse rounded bg-[#1a263c]" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AllProjectsClicksBarChartSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="grid gap-xs tablet:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded-[14px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm" key={index}>
            <div className="h-[10px] w-[78px] animate-pulse rounded bg-[#25334d]" />
            <div className="mt-[10px] h-[20px] w-[52px] animate-pulse rounded bg-[#1d2940]" />
          </div>
        ))}
      </div>

      <div className="max-w-full overflow-x-auto pb-[4px]">
        <div className="flex min-w-[760px] flex-col gap-xs">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="rounded-[16px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm" key={index}>
              <div className="flex items-center gap-sm">
                <div className="h-[28px] w-[28px] animate-pulse rounded-full bg-[#1a263c]" />
                <div className="w-[160px]">
                  <div className="h-[14px] w-[96px] animate-pulse rounded bg-[#25334d]" />
                  <div className="mt-[6px] h-[10px] w-[52px] animate-pulse rounded bg-[#162033]" />
                </div>
                <div className="h-[12px] flex-1 animate-pulse rounded-full bg-[#162033]" />
                <div className="h-[18px] w-[52px] animate-pulse rounded bg-[#1d2940]" />
              </div>
              <div className="mt-[10px] flex flex-wrap gap-[6px] pl-[44px]">
                {Array.from({ length: 4 }).map((__, chipIndex) => (
                  <div className="h-[20px] w-[70px] animate-pulse rounded-full bg-[#162033]" key={chipIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
