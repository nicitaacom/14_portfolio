"use client"

import { memo } from "react"
import { twMerge } from "tailwind-merge"
import type { TUTMTimeRange } from "../types/TUTMTimeRange"
import { useScopedI18n } from "@/locales/client"

interface Props {
  timeRange: TUTMTimeRange
  onChange: (timeRange: TUTMTimeRange) => void
}

const OPTIONS: TUTMTimeRange[] = ["1w", "1m", "1y"]

export const UTMTimeRangeSwitcher = memo(function UTMTimeRangeSwitcher({ timeRange, onChange }: Props) {
  const t = useScopedI18n("admin")

  return (
    <div className="grid h-[40px] grid-cols-3 rounded-[2px] border border-brass/40 bg-steel p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      {OPTIONS.map(option => (
        <button
          className={twMerge(
            "rounded-[2px] px-sm text-xs uppercase tracking-[0.18em] transition-colors",
            timeRange === option
              ? "bg-steel text-secondary shadow-[0_8px_18px_rgba(0,0,0,0.3)]"
              : "text-secondary-foreground hover:text-secondary",
          )}
          key={option}
          onClick={() => onChange(option)}
          type="button">
          {option === "1w" ? t("oneWeek") : option === "1m" ? t("oneMonth") : t("oneYear")}
        </button>
      ))}
    </div>
  )
})
