"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { twMerge } from "tailwind-merge"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"
import { useScopedI18n } from "@/locales/client"

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
  const t = useScopedI18n("admin")
  const sharePercent = totalWindowClicks ? Math.round((item.total_clicks / totalWindowClicks) * 100) : 0
  const animatedBarWidth = item.total_clicks ? Math.max(barWidthPercent, 6) : 0
  const linkTypes = [
    { color: "bg-[#5a5a5a]", label: t("linkDemo"), value: item.demo_clicks },
    { color: "bg-[#5a5a5a]", label: t("linkGithub"), value: item.github_clicks },
    { color: "bg-[#5a5a5a]", label: t("linkFigma"), value: item.figma_clicks },
    { color: "bg-[#5a5a5a]", label: t("linkYoutube"), value: item.youtube_clicks },
  ]

  return (
    <div
      className={twMerge(
        "rounded-[2px] border border-[#343434] bg-[#2a2a2a] px-sm py-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]",
        isSelected && "border-[#4a4a4a] bg-[#2f2f2f]",
      )}>
      <div className="flex items-center gap-sm">
        <div
          className={twMerge(
            "flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[#3a3a3a] bg-[#242424] text-xs text-secondary-foreground",
            isSelected && "border-[#4a4a4a] text-secondary",
          )}>
          {rank}
        </div>

        <div className="min-w-0 w-[160px]">
          <p className={twMerge("truncate text-sm text-secondary-foreground", isSelected && "text-secondary")}>
            {shortLabel}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-secondary-foreground">
            {item.project_group === "work" ? t("work") : t("projects")}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-[12px] overflow-hidden rounded-full bg-[#2a2a2a]">
            <motion.div
              animate={{ width: `${animatedBarWidth}%` }}
              className={twMerge(
                "h-full rounded-full bg-gradient-to-r from-[#5a5a5a] to-[#7a7a7a]",
                isSelected && "from-[#6a6a6a] to-[#8a8a8a]",
              )}
              initial={{ width: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="w-[72px] shrink-0 text-right">
          <p className={twMerge("text-sm text-secondary-foreground", isSelected && "text-secondary")}>
            {item.total_clicks}
          </p>
          <p className="text-xs uppercase tracking-[0.16em] text-secondary-foreground">{sharePercent}%</p>
        </div>
      </div>

      <div className="mt-[10px] flex flex-wrap gap-[6px] pl-[44px]">
        {linkTypes.map(linkType => (
          <span
            className="inline-flex items-center gap-[6px] rounded-full border border-[#3a3a3a] bg-[#242424] px-[8px] py-[3px] text-xs uppercase tracking-[0.14em] text-secondary-foreground"
            key={linkType.label}>
            <span className={`h-[6px] w-[6px] rounded-full ${linkType.color}`} />
            {linkType.label} {linkType.value}
          </span>
        ))}
      </div>
    </div>
  )
})
