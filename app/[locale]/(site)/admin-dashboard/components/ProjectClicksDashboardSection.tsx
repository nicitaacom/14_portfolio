"use client"

import { trackedProjects } from "@/data/repos"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { useSetProjectClicksDashboard } from "../hooks/useSetProjectClicksDashboard"
import { useProjectClicksDashboard } from "../store/useProjectClicksDashboard"
import { playAdminButtonSound } from "../utils/playAdminButtonSound"
import { ActivityChart, adminUi, AnalyticsSkeleton, LoadError, Metric, PeriodLabel, RefreshButton } from "./AdminUI"
import { FullDotReliefSvg } from "./FullDotReliefSvg"
import { ProjectsDropdown } from "./ProjectsDropdown"

export function ProjectClicksDashboardSection() {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const { refetch, isOverviewSkeleton } = useSetProjectClicksDashboard()
  const { overview, timeline, selectedProjectSlug, setSelectedProjectSlug, timelineMode, setTimelineMode, overviewErrorMessage, period } = useProjectClicksDashboard()
  const intlLocale = locale === "ua" ? "uk" : locale
  const number = new Intl.NumberFormat(intlLocale)
  const decimal = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 2 })
  const percent = (value: number) => value > 0 && value < .01 ? `<${decimal.format(.01)}%` : `${decimal.format(value)}%`
  const knownRows = trackedProjects.map(project => ({
    ...project,
    total: overview.find(row => row.project_slug === project.slug)?.total_clicks ?? 0,
  })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  const total = knownRows.reduce((sum, row) => sum + row.total, 0)
  const selected = trackedProjects.find(project => project.slug === selectedProjectSlug) ?? trackedProjects[0]
  const selectedRow = overview.find(row => row.project_slug === selected?.slug)
  const selectedTotal = selectedRow?.total_clicks ?? 0
  const destinations = [
    { key: "demo_clicks", name: t("demo") },
    { key: "github_clicks", name: t("github") },
    { key: "figma_clicks", name: t("figma") },
    { key: "youtube_clicks", name: t("youtube") },
  ] as const
  const destinationTotals = destinations.map(item => ({ ...item, total: overview.reduce((sum, row) => sum + row[item.key], 0) })).sort((a, b) => b.total - a.total)
  const leaders = knownRows.filter(row => row.total === knownRows[0]?.total && row.total > 0)
  const destinationLeaders = destinationTotals.filter(row => row.total === destinationTotals[0]?.total && row.total > 0)
  const peak = timeline.reduce<typeof timeline[number] | undefined>((best, row) => !best || row.total_clicks > best.total_clicks ? row : best, undefined)
  const date = new Intl.DateTimeFormat(intlLocale, { month: "short", ...(timelineMode === "yearly" ? { year: "numeric" as const } : { day: "numeric" as const }), timeZone: "UTC" })
  const peakDate = peak && peak.total_clicks > 0 ? date.format(new Date(peak.bucket_key.length === 7 ? `${peak.bucket_key}-01T00:00:00Z` : `${peak.bucket_key}T00:00:00Z`)) : "—"

  return <div className={`${adminUi.stack} h-full`}>
    <div>
      <div className={adminUi.toolbar}>
        <div className="flex w-full flex-wrap items-center gap-sm tablet:w-auto"><span className={adminUi.eyebrow}>{t("period")}</span><div className={adminUi.segmented} role="group" aria-label={t("period")}>
          <button type="button" aria-pressed={timelineMode === "monthly"} onClick={() => { playAdminButtonSound(1); setTimelineMode("monthly") }}>{t("last30Days")}</button>
          <button type="button" aria-pressed={timelineMode === "yearly"} onClick={() => { playAdminButtonSound(1); setTimelineMode("yearly") }}>{t("last12Months")}</button>
        </div></div>
        <RefreshButton pending={isOverviewSkeleton} onClick={() => { void refetch() }} />
      </div>
      <PeriodLabel period={period} />
    </div>
    {overviewErrorMessage && <LoadError />}
    {isOverviewSkeleton && !period ? <AnalyticsSkeleton /> : !overviewErrorMessage && <div className="relative isolate min-h-0 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[var(--3d-dot-c-202528)]" aria-hidden="true"><FullDotReliefSvg /></div>
      <div className="relative z-10 flex h-full min-w-0 flex-col gap-sm">
      <dl className={adminUi.metrics}>
        <Metric label={t("linkClicks")} value={number.format(total)} detail={t("allProjects")} />
        <Metric label={t("projectsWithClicks")} value={number.format(knownRows.filter(row => row.total > 0).length)} detail={`${number.format(trackedProjects.length)} · ${t("allProjects")}`} />
        <Metric label={t("topProject")} value={<span className="block text-[16px] leading-6 tracking-[-.25px]">{leaders[0]?.name ?? "—"}</span>} detail={leaders.length > 1 ? t("tiedLeaders", { count: leaders.length }) : leaders.length ? `${number.format(leaders[0].total)} ${t("clicks")}` : t("noClicks")} />
        <Metric label={t("topDestination")} value={<span className="block text-[16px] leading-6 tracking-[-.25px]">{destinationLeaders[0]?.name ?? "—"}</span>} detail={destinationLeaders.length > 1 ? t("tiedLeaders", { count: leaders.length }) : destinationLeaders.length ? `${number.format(destinationLeaders[0].total)} ${t("clicks")}` : t("noClicks")} />
      </dl>
      <div className="grid min-h-0 flex-1 items-start gap-sm laptop:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] laptop:items-stretch">
        <section className={`${adminUi.panel} laptop:h-full laptop:!overflow-y-auto`} aria-busy={isOverviewSkeleton}>
          <div className={adminUi.panelHeader}><h2 className={adminUi.heading}>{t("projectActivity")}</h2><span className={adminUi.badge}>{timelineMode === "monthly" ? t("last30Days") : t("last12Months")}</span></div>
          <div className="flex items-start justify-between gap-md">
            <div className={`${adminUi.field} min-w-0 max-w-[300px] flex-1`}><span>{t("selectProject")}</span><ProjectsDropdown projects={trackedProjects} selectedProjectSlug={selectedProjectSlug} onSelect={setSelectedProjectSlug} /></div>
            <div className="text-right"><strong className="block text-[33px] font-normal leading-tight tracking-[-.7px]">{number.format(selectedTotal)}</strong><span className="text-[11px] text-[var(--3d-dot-c-a3adb4)]">{t("linkClicks")}</span></div>
          </div>
          <dl className="my-md grid grid-cols-3 gap-xs border-y border-[var(--3d-dot-c-363e44)] py-sm [&_dt]:text-[9px] [&_dt]:text-[var(--3d-dot-c-a8b2b9)] [&_dd]:mt-xs [&_dd]:text-[16px] [&_dd]:text-[var(--3d-dot-c-e1e7ec)] [&_small]:mt-xs [&_small]:block [&_small]:text-[10px] [&_small]:text-[var(--3d-dot-c-a4afb7)] tablet:gap-sm">
            <div><dt>{t("share")}</dt><dd>{percent(total ? selectedTotal / total * 100 : 0)}</dd></div>
            <div><dt>{t(timelineMode === "monthly" ? "avgPerDay" : "avgPerMonth")}</dt><dd>{decimal.format(timeline.length ? selectedTotal / timeline.length : 0)}</dd></div>
            <div><dt>{t(timelineMode === "monthly" ? "busiestDay" : "busiestMonth")}</dt><dd>{peakDate}</dd>{peak && peak.total_clicks > 0 && <small>{number.format(peak.total_clicks)} {t("clicks")}</small>}</div>
          </dl>
          {isOverviewSkeleton ? <div className={`${adminUi.skeleton} min-h-[330px]`} aria-label={t("refreshing")} /> : <ActivityChart data={timeline.map(row => ({ date: row.bucket_key, value: row.total_clicks }))} unit={t("linkClicks")} monthly={timelineMode === "yearly"} />}
          <p className="mt-xs flex items-center gap-xs font-typewriter text-[10px] text-[var(--3d-dot-c-a0abb4)]"><i className="h-1 w-1 rounded-full bg-[var(--3d-dot-c-e1e7eb)]" aria-hidden="true" />{selected?.name} · {t("linkClicks")} · {t("utc")}</p>
          <div className="mt-xs border-t border-[var(--3d-dot-c-363e44)] pt-sm"><h3 className={adminUi.eyebrow}>{t("destinations")}</h3><div className="mt-sm flex flex-wrap gap-xs">
            {destinations.map(item => <span className="rounded border border-[var(--3d-dot-c-3e4850)] bg-[var(--3d-dot-c-1b2126)] px-sm py-xs text-[10px] text-[var(--3d-dot-c-9facb7)]" key={item.key}>{item.name}<strong className="ml-sm font-medium text-[var(--3d-dot-c-e2eaf0)]">{number.format(selectedRow?.[item.key] ?? 0)}</strong></span>)}
          </div></div>
        </section>
        <section className={`${adminUi.panel} laptop:h-full laptop:!overflow-y-auto`} aria-busy={isOverviewSkeleton}>
          <div className={adminUi.panelHeader}><h2 className={adminUi.heading}>{t("projectRanking")}</h2><span className={adminUi.count}>{trackedProjects.length}</span></div>
          <p className={`${adminUi.muted} text-[12px]`}>{t("rankingHelp")}</p>
          <div className="mt-sm grid gap-xs">{knownRows.map((project, index) => <button key={project.slug} type="button" className="w-full rounded-[5px] border border-transparent p-sm text-left hover:bg-[var(--3d-dot-c-2a3136)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--3d-dot-c-e8edf1)] aria-[pressed=true]:border-[var(--3d-dot-c-47515a)] aria-[pressed=true]:bg-[var(--3d-dot-c-171c20)] aria-[pressed=true]:shadow-[inset_0_1px_2px_var(--3d-dot-c-0008)]" aria-pressed={selectedProjectSlug === project.slug} onClick={() => { playAdminButtonSound(3); setSelectedProjectSlug(project.slug) }}>
            <div className="flex items-start gap-xs text-[12px]"><span className="min-w-4 font-typewriter text-[11px] leading-5 text-[var(--3d-dot-c-818d97)]">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 [overflow-wrap:anywhere] text-[var(--3d-dot-c-c3cdd5)]">{project.name}</span><span className="text-[var(--3d-dot-c-d6e0e7)]">{number.format(project.total)}</span><span className="min-w-9 text-right text-[11px] text-[var(--3d-dot-c-8c9aa5)]">{percent(total ? project.total / total * 100 : 0)}</span></div>
            <span className="ml-md mt-xs block h-0.5 overflow-hidden rounded bg-[var(--3d-dot-c-121719)]" aria-hidden="true"><span className="block h-full rounded bg-[var(--3d-dot-c-99a8b3)] aria-[pressed=true]:bg-[var(--3d-dot-c-dce6ee)]" style={{ width: `${knownRows[0]?.total ? project.total / knownRows[0].total * 100 : 0}%` }} /></span>
          </button>)}</div>
        </section>
      </div>
      </div>
    </div>}
  </div>
}
