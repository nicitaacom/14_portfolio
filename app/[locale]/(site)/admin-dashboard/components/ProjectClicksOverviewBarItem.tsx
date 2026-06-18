"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { twMerge } from "tailwind-merge"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"

interface Props {
  barWidthPercent: number
  isSelected: boolean
  item: TProjectClicksOverviewDB
  rank: number
  shortLabel: string
  totalWindowClicks: number
}

export const ProjectClicksOverviewBarItem = memo(function ProjectClicksOverviewBarItem({
  barWidthPercent,
  isSelected,
  item,
  rank,
  shortLabel,
  totalWindowClicks,
}: Props) {
  const sharePercent = totalWindowClicks ? Math.round((item.total_clicks / totalWindowClicks) * 100) : 0
  const animatedBarWidth = item.total_clicks ? Math.max(barWidthPercent, 2) : 0

  return (
    <div className={twMerge("flex items-center gap-sm py-[6px]", isSelected && "opacity-100", !isSelected && "opacity-70 hover:opacity-90 transition-opacity")}>
      <span className="w-[16px] shrink-0 text-right text-xs text-secondary-foreground">{rank}</span>

      <span className={twMerge("w-[120px] shrink-0 truncate text-xs", isSelected ? "text-secondary" : "text-secondary-foreground")}>
        {shortLabel}
      </span>

      <div className="min-w-0 flex-1">
        <div className="relative h-[2px] overflow-hidden rounded-full bg-[#2a2a2a]">
          <motion.div
            animate={{ width: `${animatedBarWidth}%` }}
            className={twMerge("h-full rounded-full", isSelected ? "bg-[#888]" : "bg-[#555]")}
            initial={{ width: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="w-[52px] shrink-0 text-right">
        <span className={twMerge("text-xs", isSelected ? "text-secondary" : "text-secondary-foreground")}>
          {item.total_clicks}
        </span>
        <span className="ml-[6px] text-xs text-secondary-foreground opacity-50">{sharePercent}%</span>
      </div>
    </div>
  )
})
