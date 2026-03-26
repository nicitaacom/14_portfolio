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
    <section className="relative min-w-0 overflow-hidden rounded-[18px] border border-[#1d2738] bg-[#0b1120] p-sm shadow-[0_24px_60px_rgba(2,8,20,0.4)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-[radial-gradient(circle_at_top_left,rgba(93,168,255,0.16),transparent_58%)]" />
      <div className="relative mb-sm flex flex-col gap-[4px]">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-[#73819c]">{title}</h2>
        <p className="max-w-[760px] text-xs text-[#90a0bb]">{subtitle}</p>
      </div>
      <div className="relative">{children}</div>
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

  const filteredOverview = useMemo(() => {
    return overview.filter(item => trackedProjects.some(project => project.slug === item.project_slug))
  }, [overview])

  const orderedOverview = useMemo(() => {
    return [...trackedProjects]
      .map(project => overviewByProjectSlug[project.slug] ?? createEmptyOverviewItemFn(project.slug, project.name, project.group))
      .sort((a, b) => b.total_clicks - a.total_clicks)
  }, [overviewByProjectSlug])

  const selectedProjectOverview = useMemo(
    () => overviewByProjectSlug[selectedProject.slug] ?? createEmptyOverviewItemFn(selectedProject.slug, selectedProject.name, selectedProject.group),
    [overviewByProjectSlug, selectedProject],
  )

  const summaryStats = useMemo(() => {
    let totalClicks = 0
    let demoClicks = 0
    let githubClicks = 0
    let figmaClicks = 0
    let youtubeClicks = 0
    let topProjectName = "No clicks yet"
    let topProjectClicks = 0

    for (const item of filteredOverview) {
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
      selectedProjectClicks: selectedProjectOverview.total_clicks,
      selectedProjectShare: totalClicks ? Math.round((selectedProjectOverview.total_clicks / totalClicks) * 100) : 0,
      topLinkType: getTopLinkTypeLabel({
        demoClicks,
        githubClicks,
        figmaClicks,
        youtubeClicks,
      }),
      topProject: topProjectName,
      totalClicks,
    }
  }, [filteredOverview, selectedProjectOverview.total_clicks])

  return (
    <div className="flex flex-col gap-sm">
      <section className="relative overflow-hidden rounded-[18px] border border-[#1d2738] bg-[#0b1120] px-sm py-sm shadow-[0_24px_60px_rgba(2,8,20,0.4)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[140px] bg-[radial-gradient(circle_at_top_left,rgba(93,168,255,0.18),transparent_62%)]" />
        <div className="flex flex-col gap-[10px] laptop:flex-row laptop:items-end laptop:justify-between">
          <div className="relative flex flex-col gap-[4px]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#73819c]">Click analytics</p>
            <h2 className="text-lg text-[#eff5ff]">Project link tracking overview</h2>
            <p className="max-w-[760px] text-xs text-[#90a0bb] tablet:text-sm">
              Clean overview of total project clicks, selected-project momentum, and cross-project ranking for the active timeframe.
            </p>
          </div>

          <Button
            className="w-full whitespace-nowrap rounded-[12px] border-[#23314b] bg-[#101829] px-sm py-xs text-[#eff5ff] hover:bg-[#15233a] tablet:w-fit"
            onClick={handleRefetch}>
            <FiRefreshCcw size={14} />
            Refetch clicks
          </Button>
        </div>

        {overviewErrorMessage ? <p className="relative mt-[8px] text-xs text-danger">Failed to load comparison data: {overviewErrorMessage}</p> : null}
        {timelineErrorMessage ? <p className="relative mt-[4px] text-xs text-danger">Failed to load timeline data: {timelineErrorMessage}</p> : null}
      </section>

      {isOverviewSkeleton ? (
        <ProjectClicksSummarySkeletonRow />
      ) : (
        <div className="grid grid-cols-1 gap-xs tablet:grid-cols-2 laptop:grid-cols-4">
          <ProjectClicksSummaryStat
            caption={`${orderedOverview.filter(item => item.total_clicks > 0).length} active projects in this window`}
            label="Window clicks"
            tone="blue"
            value={summaryStats.totalClicks}
          />
          <ProjectClicksSummaryStat
            caption={
              summaryStats.selectedProjectShare
                ? `${selectedProject.name} · ${summaryStats.selectedProjectShare}% of all tracked clicks`
                : `${selectedProject.name} has no clicks yet`
            }
            label="Selected project"
            tone="emerald"
            value={summaryStats.selectedProjectClicks}
          />
          <ProjectClicksSummaryStat
            caption="Best performer in the current timeframe"
            label="Top project"
            tone="amber"
            value={summaryStats.topProject}
          />
          <ProjectClicksSummaryStat
            caption="Most clicked destination type"
            label="Top link type"
            tone="neutral"
            value={summaryStats.topLinkType}
          />
        </div>
      )}

      <div className="flex flex-col gap-sm">
        <DashboardCard
          subtitle="Focused view of the selected project with total clicks, average pace, and the strongest bucket in the active window."
          title="Selected Project Timeline">
          <div className="mb-sm flex flex-col gap-[4px] tablet:flex-row tablet:items-center tablet:justify-between">
            <ProjectClicksPicker projects={trackedProjects} />
            <TimelineModeSwitcher timelineMode={timelineMode} onChange={setTimelineMode} />
          </div>

          {isTimelineSkeleton ? (
            <ProjectClicksLineChartSkeleton />
          ) : (
            <ProjectClicksLineChart
              projectName={selectedProject.name}
              timeline={timeline}
              timelineMode={timelineMode}
            />
          )}
        </DashboardCard>

        <DashboardCard
          subtitle="Ranked view of every project in the same selected window so the leaders, gaps, and link-type split are obvious at a glance."
          title="All Projects Comparison">
          {isOverviewSkeleton ? (
            <AllProjectsClicksBarChartSkeleton />
          ) : !orderedOverview.length ? (
            <p className="py-10 text-center text-sm text-[#8090ab]">No click data found.</p>
          ) : (
            <AllProjectsClicksBarChart overview={orderedOverview} selectedProjectSlug={selectedProjectSlug} />
          )}
        </DashboardCard>
      </div>
    </div>
  )
}
