interface ProjectClicksSummaryStatProps {
  caption?: string
  label: string
  tone?: "neutral" | "blue" | "emerald" | "amber"
  value: string | number
}

const toneStyles = {
  neutral: "bg-[#6f7f99]",
  blue: "bg-[#5da8ff]",
  emerald: "bg-[#2ec27e]",
  amber: "bg-[#f6c560]",
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function ProjectClicksSummaryStat({
  caption,
  label,
  tone = "neutral",
  value,
}: ProjectClicksSummaryStatProps) {
  const formattedValue = typeof value === "number" ? numberFormatter.format(value) : value

  return (
    <div className="rounded-[16px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm shadow-[0_18px_40px_rgba(2,8,20,0.32)]">
      <div className="flex items-center gap-[8px]">
        <span className={`h-[8px] w-[8px] rounded-full ${toneStyles[tone]}`} />
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8090ab]">{label}</p>
      </div>
      <p className="mt-[10px] truncate text-lg leading-tight text-[#eff5ff]">{formattedValue}</p>
      {caption ? <p className="mt-[6px] text-xs text-[#8c9ab3]">{caption}</p> : null}
    </div>
  )
}
