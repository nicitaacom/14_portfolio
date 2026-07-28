interface ProjectClicksSummaryStatProps {
  caption?: string
  label: string
  tone?: "neutral" | "blue" | "emerald" | "amber"
  value: string | number
}

const toneStyles = {
  neutral: "bg-[#5a5a5a]",
  blue: "bg-[#5a5a5a]",
  emerald: "bg-[#5a5a5a]",
  amber: "bg-[#5a5a5a]",
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function ProjectClicksSummaryStat({ caption, label, tone = "neutral", value }: ProjectClicksSummaryStatProps) {
  const formattedValue = typeof value === "number" ? numberFormatter.format(value) : value

  return (
    <div className="rounded-[2px] border border-brass/40 bg-steel px-sm py-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-[8px]">
        <span className={`h-[8px] w-[8px] rounded-full ${toneStyles[tone]}`} />
        <p className="text-xs uppercase tracking-[0.18em] text-secondary-foreground">{label}</p>
      </div>
      <p className="mt-[10px] truncate text-lg leading-tight text-secondary">{formattedValue}</p>
      {caption ? <p className="mt-[6px] text-xs text-secondary-foreground">{caption}</p> : null}
    </div>
  )
}
