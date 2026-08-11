"use client"

import { useMemo } from "react"
import { trackedProjectsMap } from "@/data/repos"
import { ProjectClicksOverviewBarItem } from "./ProjectClicksOverviewBarItem"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"
import { useScopedI18n } from "@/locales/client"

interface AllProjectsClicksBarChartProps {
  overview: TProjectClicksOverviewDB[]
  selectedProjectSlug: string
}

export function AllProjectsClicksBarChart({ overview, selectedProjectSlug }: AllProjectsClicksBarChartProps) {
  const t = useScopedI18n("admin")
  const maxClicks = useMemo(() => Math.max(...overview.map(item => item.total_clicks), 1), [overview])
  const totalClicks = useMemo(() => overview.reduce((sum, item) => sum + item.total_clicks, 0), [overview])
  const activeProjects = useMemo(() => overview.filter(item => item.total_clicks > 0).length, [overview])
  const selectedProject = useMemo(
    () => overview.find(item => item.project_slug === selectedProjectSlug) ?? overview[0],
    [overview, selectedProjectSlug],
  )
  const selectedProjectShare =
    totalClicks && selectedProject ? Math.round((selectedProject.total_clicks / totalClicks) * 100) : 0

  if (!overview.length) {
    return <p className="py-10 text-center text-sm text-secondary-foreground">{t("noWindowClickData")}</p>
  }

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="flex gap-sm text-xs text-secondary-foreground">
        <span>{t("windowTotal")} <span className="text-secondary">{totalClicks}</span></span>
        <span className="opacity-30">·</span>
        <span>{t("activeProjects")} <span className="text-secondary">{activeProjects}</span></span>
        <span className="opacity-30">·</span>
        <span>{t("selectedShare")} <span className="text-secondary">{selectedProjectShare}%</span></span>
      </div>

      <div className="flex flex-col divide-y divide-[#2a2a2a]">
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
  )
}
