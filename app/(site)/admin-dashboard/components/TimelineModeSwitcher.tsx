"use client"

import { memo } from "react"
import { twMerge } from "tailwind-merge"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"

interface Props {
  timelineMode: TProjectClicksTimelineMode
  onChange: (timelineMode: TProjectClicksTimelineMode) => void
}

const TIMELINE_OPTIONS: TProjectClicksTimelineMode[] = ["monthly", "yearly"]

export const TimelineModeSwitcher = memo(function TimelineModeSwitcher({ timelineMode, onChange }: Props) {
  return (
    <div className="grid h-[40px] grid-cols-2 rounded-[12px] border border-[#223049] bg-[#0f1728] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      {TIMELINE_OPTIONS.map(option => (
        <button
          className={twMerge(
            "rounded-[10px] px-sm text-xs uppercase tracking-[0.18em] transition-colors",
            timelineMode === option
              ? "bg-[#16233a] text-[#eff5ff] shadow-[0_8px_18px_rgba(3,10,24,0.3)]"
              : "text-[#8090ab] hover:text-[#eff5ff]",
          )}
          key={option}
          onClick={() => onChange(option)}
          type="button">
          {option}
        </button>
      ))}
    </div>
  )
})
