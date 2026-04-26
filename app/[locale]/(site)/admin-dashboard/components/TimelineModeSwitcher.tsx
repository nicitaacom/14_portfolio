"use client"

import { memo } from "react"
import { twMerge } from "tailwind-merge"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"
import { useScopedI18n } from "@/locales/client"

interface Props {
  timelineMode: TProjectClicksTimelineMode
  onChange: (timelineMode: TProjectClicksTimelineMode) => void
}

const TIMELINE_OPTIONS: TProjectClicksTimelineMode[] = ["monthly", "yearly"]

export const TimelineModeSwitcher = memo(function TimelineModeSwitcher({ timelineMode, onChange }: Props) {
  const t = useScopedI18n("admin")

  return (
    <div className="grid h-[40px] grid-cols-2 rounded-[2px] border border-[#343434] bg-[#2a2a2a] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      {TIMELINE_OPTIONS.map(option => (
        <button
          className={twMerge(
            "rounded-[2px] px-sm text-xs uppercase tracking-[0.18em] transition-colors",
            timelineMode === option
              ? "bg-[#3a3a3a] text-secondary shadow-[0_8px_18px_rgba(0,0,0,0.3)]"
              : "text-secondary-foreground hover:text-secondary",
          )}
          key={option}
          onClick={() => onChange(option)}
          type="button">
          {option === "monthly" ? t("monthly") : t("yearly")}
        </button>
      ))}
    </div>
  )
})
