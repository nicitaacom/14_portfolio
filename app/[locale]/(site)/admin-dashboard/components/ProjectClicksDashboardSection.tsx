"use client"

import { useCallback, type ReactNode, useMemo } from "react"
import { FiRefreshCcw } from "react-icons/fi"
import { Button } from "@/components/Button"
import { trackedProjects } from "@/data/repos"
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
import { useScopedI18n } from "@/locales/client"

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
    <section className="rounded-[2px] border border-brass/40 bg-steel p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-sm flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{title}</h2>
        <p className="max-w-[760px] text-xs text-secondary-foreground">{subtitle}</p>
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
  t,
}: {
  demoClicks: number
  githubClicks: number
  figmaClicks: number
  youtubeClicks: number
  t: ReturnType<typeof useScopedI18n>
}) {
  const linkTypes = [
    { label: t("linkDemo"), value: demoClicks },
    { label: t("linkGithub"), value: githubClicks },
    { label: t("linkFigma"), value: figmaClicks },
    { label: t("linkYoutube"), value: youtubeClicks },
  ]

  const topLinkType = [...linkTypes].sort((a, b) => b.value - a.value)[0]

  if (!topLinkType || topLinkType.value === 0) return t("noClicksYet")

  return `${topLinkType.label} (${topLinkType.value})`
}

function createEmptyOverviewItemFn(
  projectSlug: string,
  projectName: string,
  projectGroup: API.TrackedProjectGroup,
): TProjectClicksOverviewDB {
  return {
    project_slug: projectSlug,
    project_name: projectName,
    project_group: projectGroup,
    ...EMPTY_OVERVIEW_VALUES,
  }
}

export function ProjectClicksDashboardSection() {
  const t = useScopedI18n("admin")
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
      Object.fromEntries(overview.map(item => [item.project_slug, item])) as Record<string, TProjectClicksOverviewDB>,
    [overview],
  )

  const filteredOverview = useMemo(() => {
    return overview.filter(item => trackedProjects.some(project => project.slug === item.project_slug))
  }, [overview])

  const orderedOverview = useMemo(() => {
    return [...trackedProjects]
      .map(
        project =>
          overviewByProjectSlug[project.slug] ?? createEmptyOverviewItemFn(project.slug, project.name, project.group),
      )
      .filter(item => item.total_clicks > 0)
      .sort((a, b) => b.total_clicks - a.total_clicks)
  }, [overviewByProjectSlug])

  const selectedProjectOverview = useMemo(
    () =>
      overviewByProjectSlug[selectedProject.slug] ??
      createEmptyOverviewItemFn(selectedProject.slug, selectedProject.name, selectedProject.group),
    [overviewByProjectSlug, selectedProject],
  )

  const summaryStats = useMemo(() => {
    let totalClicks = 0
    let demoClicks = 0
    let githubClicks = 0
    let figmaClicks = 0
    let youtubeClicks = 0
    let topProjectName = t("noClicksYet")
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
        t,
      }),
      topProject: topProjectName,
      totalClicks,
    }
  }, [filteredOverview, selectedProjectOverview.total_clicks, t])

  return (
    <div className="flex flex-col gap-sm">
      <section className="rounded-[2px] border border-brass/40 bg-steel px-sm py-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{t("projectOverviewTitle")}</h2>
            <p className="max-w-[760px] text-xs text-secondary-foreground">{t("projectOverviewSubtitle")}</p>
          </div>

          <Button
            className="inline-flex w-fit items-center justify-center gap-[8px] rounded-[2px] border border-brass/40 bg-steel px-sm py-xs text-secondary hover:bg-steel transition"
            onClick={handleRefetch}
            requestAction
            requestPending={isOverviewSkeleton || isTimelineSkeleton}>
            <FiRefreshCcw size={14} />
            {t("refetch")}
          </Button>
        </div>

        {overviewErrorMessage ? (
          <p className="relative mt-[8px] text-xs text-danger">
            {t("comparisonLoadError", { message: overviewErrorMessage })}
          </p>
        ) : null}
        {timelineErrorMessage ? (
          <p className="relative mt-[4px] text-xs text-danger">
            {t("timelineLoadError", { message: timelineErrorMessage })}
          </p>
        ) : null}
      </section>

      {isOverviewSkeleton ? (
        <ProjectClicksSummarySkeletonRow />
      ) : (
        <div className="grid grid-cols-1 gap-xs tablet:grid-cols-2 laptop:grid-cols-4">
          <ProjectClicksSummaryStat
            caption={t("activeProjectsInWindow", {
              count: orderedOverview.filter(item => item.total_clicks > 0).length,
            })}
            label={t("windowClicks")}
            tone="blue"
            value={summaryStats.totalClicks}
          />
          <ProjectClicksSummaryStat
            caption={
              summaryStats.selectedProjectShare
                ? t("selectedProjectShare", {
                    projectName: selectedProject.name,
                    share: summaryStats.selectedProjectShare,
                  })
                : t("selectedProjectNoClicks", { projectName: selectedProject.name })
            }
            label={t("selectedProject")}
            tone="emerald"
            value={summaryStats.selectedProjectClicks}
          />
          <ProjectClicksSummaryStat
            caption={t("bestPerformer")}
            label={t("topProject")}
            tone="amber"
            value={summaryStats.topProject}
          />
          <ProjectClicksSummaryStat
            caption={t("mostClickedDestination")}
            label={t("topLinkType")}
            tone="neutral"
            value={summaryStats.topLinkType}
          />
        </div>
      )}

      <div className="flex flex-col gap-sm">
        <DashboardCard subtitle={t("selectedTimelineSubtitle")} title={t("selectedTimelineTitle")}>
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

        <DashboardCard subtitle={t("allProjectsComparisonSubtitle")} title={t("allProjectsComparisonTitle")}>
          {isOverviewSkeleton ? (
            <AllProjectsClicksBarChartSkeleton />
          ) : !orderedOverview.length ? (
            <p className="py-10 text-center text-sm text-info">{t("noClickDataFound")}</p>
          ) : (
            <AllProjectsClicksBarChart overview={orderedOverview} selectedProjectSlug={selectedProjectSlug} />
          )}
        </DashboardCard>
      </div>
    </div>
  )
}
