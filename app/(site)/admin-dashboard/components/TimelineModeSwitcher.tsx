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
    <div className="grid h-[40px] grid-cols-2 rounded-[8px] border border-[#3f3f3f] bg-[#1f1f1f] p-[3px]">
      {TIMELINE_OPTIONS.map(option => (
        <button
          className={twMerge(
            "rounded-[6px] px-sm text-xs uppercase tracking-[0.18em] transition-colors",
            timelineMode === option ? "bg-[#2f203d] text-secondary" : "text-secondary-foreground hover:text-secondary",
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
