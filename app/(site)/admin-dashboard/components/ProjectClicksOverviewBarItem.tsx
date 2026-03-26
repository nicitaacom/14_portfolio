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
  const animatedBarWidth = item.total_clicks ? Math.max(barWidthPercent, 6) : 0
  const linkTypes = [
    { color: "bg-[#5da8ff]", label: "Demo", value: item.demo_clicks },
    { color: "bg-[#8fd16a]", label: "GitHub", value: item.github_clicks },
    { color: "bg-[#f6c560]", label: "Figma", value: item.figma_clicks },
    { color: "bg-[#ff8b8b]", label: "YouTube", value: item.youtube_clicks },
  ]

  return (
    <div
      className={twMerge(
        "rounded-[16px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm shadow-[0_16px_36px_rgba(2,8,20,0.24)]",
        isSelected && "border-[#35548c] bg-[#101a2d]",
      )}>
      <div className="flex items-center gap-sm">
        <div
          className={twMerge(
            "flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[#24314a] bg-[#101829] text-[11px] text-[#7d8ca6]",
            isSelected && "border-[#466cb6] text-[#eff5ff]",
          )}>
          {rank}
        </div>

        <div className="min-w-0 w-[160px]">
          <p className={twMerge("truncate text-sm text-[#d7e2f3]", isSelected && "text-[#eff5ff]")}>{shortLabel}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#73819c]">{item.project_group}</p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-[12px] overflow-hidden rounded-full bg-[#162033]">
            <motion.div
              animate={{ width: `${animatedBarWidth}%` }}
              className={twMerge(
                "h-full rounded-full bg-gradient-to-r from-[#2d6cdf] to-[#78beff]",
                isSelected && "from-[#5f9dff] to-[#b9dcff]",
              )}
              initial={{ width: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="w-[72px] shrink-0 text-right">
          <p className={twMerge("text-sm text-[#d7e2f3]", isSelected && "text-[#eff5ff]")}>{item.total_clicks}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#73819c]">{sharePercent}%</p>
        </div>
      </div>

      <div className="mt-[10px] flex flex-wrap gap-[6px] pl-[44px]">
        {linkTypes.map(linkType => (
          <span
            className="inline-flex items-center gap-[6px] rounded-full border border-[#213049] bg-[#101829] px-[8px] py-[3px] text-[10px] uppercase tracking-[0.14em] text-[#7d8ca6]"
            key={linkType.label}>
            <span className={`h-[6px] w-[6px] rounded-full ${linkType.color}`} />
            {linkType.label} {linkType.value}
          </span>
        ))}
      </div>
    </div>
  )
})
