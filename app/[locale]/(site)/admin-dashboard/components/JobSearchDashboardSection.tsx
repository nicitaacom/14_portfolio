"use client"

import { useMemo } from "react"
import { jobSearchStats, jobSearchStatsError } from "../data/jobSearchStats"
import { ApplicationsDeltaChart } from "./ApplicationsDeltaChart"
import { JobSearchMonthCard } from "./JobSearchMonthCard"
import { getApplicationsStatusTone } from "../utils/getApplicationsStatusTone"
import { getAppointmentsStatusTone } from "../utils/getAppointmentsStatusTone"
import type { TApplicationsTone } from "../types/TApplicationsTone"
import { useScopedI18n } from "@/locales/client"

const avgToneClassMap: Record<TApplicationsTone, string> = {
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
}

const AVATAR_DOC_URL =
  "https://docs.google.com/document/d/1KnNw5OJ6iL7-ZSGpE74MYBMUUARHin3KnETWWKDuywc/edit?tab=t.0"

function SummaryStat({ label, value, valueClassName }: { label: string; value: string | number; valueClassName?: string }) {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className={`mt-[2px] text-lg ${valueClassName ?? "text-secondary"}`}>{value}</p>
    </div>
  )
}

export function JobSearchDashboardSection() {
  const t = useScopedI18n("admin")

  const sortedMonths = useMemo(
    () => [...jobSearchStats].sort((a, b) => b.month.localeCompare(a.month)),
    [],
  )

  const totals = useMemo(() => {
    // amountApplies and appointments are cumulative — the last entry (by month) holds the true totals
    const lastEntry = [...jobSearchStats].sort((a, b) => b.month.localeCompare(a.month))[0]
    const totalAmountApplies = lastEntry?.amountApplies ?? 0
    const totalAppointments = lastEntry?.appointments ?? 0
    // skip first entry for averages — it has no previous month so its delta equals the full cumulative total
    const deltaMonths = jobSearchStats.length > 1 ? jobSearchStats.slice(1) : []
    const deltaSum = deltaMonths.reduce((acc, month) => acc + month.applications, 0)
    const avgApplications = deltaMonths.length > 0 ? Math.round(deltaSum / deltaMonths.length) : 0
    const avgTone = getApplicationsStatusTone(avgApplications)
    // appointments delta per month: current - previous
    const sorted = [...jobSearchStats].sort((a, b) => a.month.localeCompare(b.month))
    const apptDeltas = sorted.slice(1).map((m, i) => m.appointments - sorted[i].appointments)
    const avgAppointments = apptDeltas.length > 0 ? Math.round(apptDeltas.reduce((a, b) => a + b, 0) / apptDeltas.length) : 0
    const avgAppointmentsTone = getAppointmentsStatusTone(avgAppointments)
    // avg conversion: mean of per-month conversionRate values (skip nulls)
    const conversionRates = jobSearchStats.map(m => m.conversionRate).filter((r): r is number => r !== null)
    const avgConversionRate = conversionRates.length > 0
      ? Math.round(conversionRates.reduce((a, b) => a + b, 0) / conversionRates.length * 100) / 100
      : null
    return { totalAmountApplies, totalAppointments, avgApplications, avgTone, avgAppointments, avgAppointmentsTone, avgConversionRate }
  }, [])

  if (jobSearchStatsError) {
    return (
      <section className="rounded-[2px] border border-danger/40 bg-danger/10 p-sm">
        <h2 className="mb-[4px] text-sm uppercase tracking-[0.18em] text-danger">{t("jobSearchTitle")}</h2>
        <p className="font-mono text-xs text-danger">{jobSearchStatsError}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-sm flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{t("jobSearchTitle")}</h2>
        <p className="text-xs text-secondary-foreground">
          {t("jobSearchSubtitle")}{" "}
          <a
            className="text-cta hover:underline"
            href={AVATAR_DOC_URL}
            rel="noopener noreferrer"
            target="_blank">
            {t("avatarDocLink")}
          </a>
        </p>
      </div>

      <div className="mb-sm grid grid-cols-2 gap-[4px] laptop:grid-cols-3">
        <SummaryStat label={t("totalAppointments")} value={totals.totalAppointments} />
        <SummaryStat label={t("totalAmountApplies")} value={totals.totalAmountApplies} />
        <SummaryStat label={t("monthsTracked")} value={jobSearchStats.length} />
        <SummaryStat label={t("avgApplications")} value={totals.avgApplications} valueClassName={avgToneClassMap[totals.avgTone]} />
        <SummaryStat label={t("avgAppointments")} value={totals.avgAppointments} valueClassName={avgToneClassMap[totals.avgAppointmentsTone]} />
        <SummaryStat label={t("avgConversionRate")} value={totals.avgConversionRate !== null ? `${totals.avgConversionRate}%` : "—"} />
      </div>

      <ApplicationsDeltaChart months={jobSearchStats} />

      {sortedMonths.length ? (
        <div className="grid grid-cols-1 gap-[4px] tablet:grid-cols-2 laptop:grid-cols-3">
          {sortedMonths.map(month => (
            <JobSearchMonthCard key={month.month} month={month} />
          ))}
        </div>
      ) : (
        <p className="py-lg text-center text-sm text-secondary-foreground">{t("noJobSearchData")}</p>
      )}


    </section>
  )
}
