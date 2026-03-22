"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { twMerge } from "tailwind-merge"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"

interface Props {
  item: TProjectClicksOverviewDB
  isSelected: boolean
  heightPercent: number
  shortLabel: string
}

export const ProjectClicksOverviewBarItem = memo(function ProjectClicksOverviewBarItem({
  item,
  isSelected,
  heightPercent,
  shortLabel,
}: Props) {
  return (
    <div className="flex min-w-[56px] flex-1 flex-col items-center gap-[6px]">
      <span className={twMerge("text-[10px] text-secondary-foreground", isSelected && "text-secondary")}>{item.total_clicks}</span>

      <div className="flex h-[180px] w-full items-end justify-center rounded-[8px] border border-[#343434] bg-[#1d1d1d] px-[6px] py-[6px]">
        <motion.div
          animate={{ height: `${Math.max(heightPercent, 6)}%` }}
          className={twMerge(
            "w-full rounded-[6px] bg-[#2d5bff]",
            isSelected && "bg-[#c05cff]",
          )}
          initial={{ height: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      </div>

      <span className={twMerge("truncate text-center text-[10px] uppercase tracking-[0.14em] text-secondary-foreground", isSelected && "text-secondary")}>
        {shortLabel}
      </span>
    </div>
  )
})
