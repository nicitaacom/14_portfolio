"use client"

import { useMemo } from "react"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { ProjectClicksOverviewBarItem } from "./ProjectClicksOverviewBarItem"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"

interface AllProjectsClicksBarChartProps {
  overview: TProjectClicksOverviewDB[]
  selectedProjectSlug: string
}

export function AllProjectsClicksBarChart({ overview, selectedProjectSlug }: AllProjectsClicksBarChartProps) {
  const maxClicks = useMemo(() => Math.max(...overview.map(item => item.total_clicks), 1), [overview])
  const totalClicks = useMemo(() => overview.reduce((sum, item) => sum + item.total_clicks, 0), [overview])
  const activeProjects = useMemo(() => overview.filter(item => item.total_clicks > 0).length, [overview])
  const selectedProject = useMemo(
    () => overview.find(item => item.project_slug === selectedProjectSlug) ?? overview[0],
    [overview, selectedProjectSlug],
  )
  const selectedProjectShare = totalClicks && selectedProject ? Math.round((selectedProject.total_clicks / totalClicks) * 100) : 0

  if (!overview.length) {
    return <p className="py-10 text-center text-sm text-[#8090ab]">No click data yet for the selected window.</p>
  }

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="grid gap-xs tablet:grid-cols-3">
        <div className="rounded-[14px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d8ca6]">Window total</p>
          <p className="mt-[6px] text-lg text-[#eff5ff]">{totalClicks}</p>
        </div>
        <div className="rounded-[14px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d8ca6]">Active projects</p>
          <p className="mt-[6px] text-lg text-[#eff5ff]">{activeProjects}</p>
        </div>
        <div className="rounded-[14px] border border-[#1d2738] bg-[#0f1728] px-sm py-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d8ca6]">Selected share</p>
          <p className="mt-[6px] text-lg text-[#eff5ff]">{selectedProjectShare}%</p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto pb-[4px]">
        <div className="flex min-w-[760px] flex-col gap-xs">
          {overview.map((item, index) => (
            <ProjectClicksOverviewBarItem
              barWidthPercent={(item.total_clicks / maxClicks) * 100}
              isSelected={item.project_slug === selectedProjectSlug}
              item={item}
              key={item.project_slug}
              rank={index + 1}
              shortLabel={trackedProjectsMap[item.project_slug]?.shortName ?? item.project_name}
              totalWindowClicks={totalClicks}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
