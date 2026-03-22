"use client"

import { useMemo } from "react"
import { trackedProjectsMap } from "@/data/trackedProjects"
import { ProjectClicksOverviewBarItem } from "./ProjectClicksOverviewBarItem"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"

interface Props {
  overview: TProjectClicksOverviewDB[]
  selectedProjectSlug: string
}

export function AllProjectsClicksBarChart({ overview, selectedProjectSlug }: Props) {
  const maxClicks = useMemo(() => Math.max(...overview.map(item => item.total_clicks), 1), [overview])

  if (!overview.length) {
    return <p className="py-10 text-center text-sm text-secondary-foreground">No click data yet for the selected window.</p>
  }

  return (
    <div className="max-w-full overflow-x-auto pb-[4px]">
      <div className="flex min-w-[720px] items-end gap-xs">
        {overview.map(item => (
          <ProjectClicksOverviewBarItem
            heightPercent={(item.total_clicks / maxClicks) * 100}
            isSelected={item.project_slug === selectedProjectSlug}
            item={item}
            key={item.project_slug}
            shortLabel={trackedProjectsMap[item.project_slug]?.shortName ?? item.project_name}
          />
        ))}
      </div>
    </div>
  )
}
