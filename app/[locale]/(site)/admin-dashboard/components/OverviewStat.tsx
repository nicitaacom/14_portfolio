"use client"

export function OverviewStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className="mt-[2px] text-lg text-secondary">{value}</p>
    </div>
  )
}
