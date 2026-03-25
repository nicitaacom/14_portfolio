"use client"

import { useCallback, type ReactNode, useMemo } from "react"
import { FiRefreshCcw } from "react-icons/fi"
import { Button } from "@/components/Button"
import { trackedProjects } from "@/data/trackedProjects"
import { useSetProjectClicksDashboard } from "../hooks/useSetProjectClicksDashboard"
import { useProjectClicksDashboard } from "../store/useProjectClicksDashboard"
import { ProjectClicksSummaryStat } from "./ProjectClicksSummaryStat"
import { ProjectClicksPicker } from "./ProjectClicksPicker/ProjectClicksPicker"
import { TimelineModeSwitcher } from "./TimelineModeSwitcher"
import { ProjectClicksLineChart } from "./ProjectClicksLineChart"
import { AllProjectsClicksBarChart } from "./AllProjectsClicksBarChart"
import {
  AllProjectsClicksBarChartSkeleton,
  ProjectClicksLineChartSkeleton,
  ProjectClicksSummarySkeletonRow,
} from "./ProjectClicksSkeletons"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"

interface DashboardCardProps {
  children: ReactNode
  subtitle: string
  title: string
}

const EMPTY_OVERVIEW_VALUES = {
  total_clicks: 0,
  demo_clicks: 0,
  github_clicks: 0,
  figma_clicks: 0,
  youtube_clicks: 0,
}

function DashboardCard({ children, subtitle, title }: DashboardCardProps) {
  return (
    <section className="min-w-0 rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-[4px] flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{title}</h2>
        <p className="text-xs">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function getTopLinkTypeLabel({
  demoClicks,
  githubClicks,
  figmaClicks,
  youtubeClicks,
}: {
  demoClicks: number
  githubClicks: number
  figmaClicks: number
  youtubeClicks: number
}) {
  const linkTypes = [
    { label: "Demo", value: demoClicks },
    { label: "GitHub", value: githubClicks },
    { label: "Figma", value: figmaClicks },
    { label: "YouTube", value: youtubeClicks },
  ]

  const topLinkType = [...linkTypes].sort((a, b) => b.value - a.value)[0]

  if (!topLinkType || topLinkType.value === 0) return "No clicks yet"

  return `${topLinkType.label} (${topLinkType.value})`
}

function createEmptyOverviewItemFn(projectSlug: string, projectName: string, projectGroup: API.TrackedProjectGroup): TProjectClicksOverviewDB {
  return {
    project_slug: projectSlug,
    project_name: projectName,
    project_group: projectGroup,
    ...EMPTY_OVERVIEW_VALUES,
  }
}

export function ProjectClicksDashboardSection() {
  const { refetch, isOverviewSkeleton, isTimelineSkeleton } = useSetProjectClicksDashboard()
  const {
    overview,
    timeline,
    selectedProjectSlug,
    timelineMode,
    setTimelineMode,
    overviewErrorMessage,
    timelineErrorMessage,
  } = useProjectClicksDashboard()

  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  const selectedProject = useMemo(
    () => trackedProjects.find(project => project.slug === selectedProjectSlug) ?? trackedProjects[0],
    [selectedProjectSlug],
  )

  const overviewByProjectSlug = useMemo(
    () =>
      Object.fromEntries(
        overview.map(item => [item.project_slug, item]),
      ) as Record<string, TProjectClicksOverviewDB>,
    [overview],
  )

  const orderedOverview = useMemo(() => {
    return [...trackedProjects]
      .map(project => overviewByProjectSlug[project.slug] ?? createEmptyOverviewItemFn(project.slug, project.name, project.group))
      .sort((a, b) => b.total_clicks - a.total_clicks)
  }, [overviewByProjectSlug])

  const summaryStats = useMemo(() => {
    let totalClicks = 0
    let demoClicks = 0
    let githubClicks = 0
    let figmaClicks = 0
    let youtubeClicks = 0
    let topProjectName = "No clicks yet"
    let topProjectClicks = 0

    for (const item of overview) {
      totalClicks += item.total_clicks
      demoClicks += item.demo_clicks
      githubClicks += item.github_clicks
      figmaClicks += item.figma_clicks
      youtubeClicks += item.youtube_clicks

      if (item.total_clicks > topProjectClicks) {
        topProjectClicks = item.total_clicks
        topProjectName = `${item.project_name} (${item.total_clicks})`
      }
    }

    return {
      totalClicks,
      topProject: topProjectName,
      topLinkType: getTopLinkTypeLabel({
        demoClicks,
        githubClicks,
        figmaClicks,
        youtubeClicks,
      }),
    }
  }, [overview])

  return (
    <div className="flex flex-col gap-[4px]">
      <section className="rounded-[2px] border border-[#323232] bg-[#242424] px-sm py-sm shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-[10px] laptop:flex-row laptop:items-end laptop:justify-between">
          <div className="flex flex-col gap-[4px]">
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">Click analytics</p>
            <h2 className="text-lg text-secondary">Project link tracking overview</h2>
            <p className="max-w-[760px] text-xs tablet:text-sm">
              This section reads aggregated project link clicks from SQL functions and keeps project selection, timeframe, loading state,
              and refetch logic on the client through a dedicated hook + SDK flow.
            </p>
          </div>

          <Button className="w-full whitespace-nowrap tablet:w-fit" onClick={handleRefetch}>
            <FiRefreshCcw size={14} />
            Refetch clicks
          </Button>
        </div>

        {overviewErrorMessage ? <p className="mt-[8px] text-xs text-danger">Failed to load comparison data: {overviewErrorMessage}</p> : null}
        {timelineErrorMessage ? <p className="mt-[4px] text-xs text-danger">Failed to load timeline data: {timelineErrorMessage}</p> : null}
      </section>

      {isOverviewSkeleton ? (
        <ProjectClicksSummarySkeletonRow />
      ) : (
        <div className="grid grid-cols-2 gap-[4px] laptop:grid-cols-4">
          <ProjectClicksSummaryStat label="Total clicks" value={summaryStats.totalClicks} />
          <ProjectClicksSummaryStat label="Top project" value={summaryStats.topProject} />
          <ProjectClicksSummaryStat label="Top link type" value={summaryStats.topLinkType} />
          <ProjectClicksSummaryStat label="Timeline" value={timelineMode === "monthly" ? "Monthly" : "Yearly"} />
        </div>
      )}

      <div className="flex flex-col gap-[4px]">
        <DashboardCard subtitle="Same dropdown structure as TimeZonePicker, but project-focused and timeline-aware." title="Selected Project Timeline">
          <div className="mb-sm flex flex-col gap-[4px] tablet:flex-row tablet:items-center tablet:justify-between">
            <ProjectClicksPicker projects={trackedProjects} />
            <TimelineModeSwitcher timelineMode={timelineMode} onChange={setTimelineMode} />
          </div>

          {isTimelineSkeleton ? (
            <ProjectClicksLineChartSkeleton />
          ) : (
            <ProjectClicksLineChart
              projectName={selectedProject?.name ?? "Selected project"}
              timeline={timeline}
              timelineMode={timelineMode}
            />
          )}
        </DashboardCard>

        <DashboardCard subtitle="Each column represents one project for the same selected timeframe." title="All Projects Comparison">
          {isOverviewSkeleton ? (
            <AllProjectsClicksBarChartSkeleton />
          ) : !orderedOverview.length ? (
            <p className="py-10 text-center text-sm text-secondary-foreground">No click data found.</p>
          ) : (
            <AllProjectsClicksBarChart overview={orderedOverview} selectedProjectSlug={selectedProjectSlug} />
          )}
        </DashboardCard>
      </div>
    </div>
  )
}
