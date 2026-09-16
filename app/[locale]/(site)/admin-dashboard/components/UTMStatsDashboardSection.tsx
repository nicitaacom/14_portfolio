"use client"

import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { useUTMStats } from "../hooks/useUTMStats"
import { playAdminButtonSound } from "../utils/playAdminButtonSound"
import { ActivityChart, adminUi, AnalyticsSkeleton, Breakdown, LoadError, Metric, PanelRelief, PeriodLabel, RefreshButton } from "./AdminUI"

export function UTMStatsDashboardSection() {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const { utmStats, isLoading, error, timeRange, setTimeRange, refetch } = useUTMStats()
  const number = new Intl.NumberFormat(locale === "ua" ? "uk" : locale)
  const decimal = new Intl.NumberFormat(locale === "ua" ? "uk" : locale, { maximumFractionDigits: 2 })
  const options = [{ id: "1w", label: "last7Days" }, { id: "1m", label: "last30Days" }, { id: "1y", label: "last12Months" }] as const

  return <div className={adminUi.stack}>
    <div>
      <div className={`${adminUi.toolbar} justify-start`}><div className="flex w-full flex-wrap items-center gap-md tablet:w-auto"><span className={`${adminUi.eyebrow} py-0`}>{t("period")}</span><div className={adminUi.segmented} role="group" aria-label={t("period")}>
        {options.map(option => <button className="whitespace-nowrap" key={option.id} type="button" aria-pressed={timeRange === option.id} onClick={() => { playAdminButtonSound(1); setTimeRange(option.id) }}>{t(option.label)}</button>)}
      </div></div><RefreshButton pending={isLoading} onClick={refetch} /></div>
      <PeriodLabel period={utmStats?.period ?? null} />
    </div>
    {error && <LoadError />}
    {isLoading ? <AnalyticsSkeleton /> : !error && utmStats && <>
      <dl className={`${adminUi.metrics} laptop:grid-cols-3`}>
        <Metric label={t("recordedVisits")} value={number.format(utmStats.totalVisits)} detail={t("trafficScope")} />
        <Metric label={t("trackedVisitors")} value={number.format(utmStats.uniqueUsers)} detail={t("trafficScope")} />
        <Metric label={t(timeRange === "1y" ? "avgPerMonth" : "avgPerDay")} value={decimal.format(utmStats.chartData.length ? utmStats.totalVisits / utmStats.chartData.length : 0)} detail={t("includesCurrent")} />
      </dl>
      <section className={adminUi.panel}>
        <PanelRelief />
        <div className={adminUi.panelHeader}><h2 className={adminUi.heading}>{t("visitsOverTime")}</h2><span className={adminUi.badge}>{t("trafficScope")}</span></div>
        <ActivityChart data={utmStats.chartData.map(row => ({ date: row.date, value: row.visits }))} unit={t("recordedVisits")} monthly={timeRange === "1y"} />
        <p className="mt-xs flex items-center gap-xs font-typewriter text-[10px] text-[var(--3d-dot-c-a0abb4)]"><i className="h-1 w-1 rounded-full bg-[var(--3d-dot-c-e1e7eb)]" aria-hidden="true" />{t("recordedVisits")} · {t("utc")}</p>
      </section>
      <div className="grid gap-sm laptop:grid-cols-3 laptop:gap-md">
        <Breakdown title={t("sources")} items={utmStats.sourceStats} total={utmStats.totalVisits} />
        <Breakdown title={t("mediums")} items={utmStats.mediumStats} total={utmStats.totalVisits} />
        <Breakdown title={t("campaigns")} items={utmStats.campaignStats} total={utmStats.totalVisits} />
      </div>
    </>}
  </div>
}
