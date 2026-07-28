interface TooltipTextProps {
  label: string,
  tooltip: React.ReactNode
  className?: string
}

export function TooltipText({ label, tooltip, className }: TooltipTextProps) {
  return (
    <div className="relative inline-block">
      <span data-text={label} className="tape-label text-tooltip-inline tooltip px-[3px]">{label}
        <div className={`tooltiptext ${className}`}>
          {tooltip}
        </div>
      </span>
    </div>
  )
}
