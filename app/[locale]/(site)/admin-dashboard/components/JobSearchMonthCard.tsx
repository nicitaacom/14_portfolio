"use client"

import { useScopedI18n } from "@/locales/client"
import type { TJobSearchMonth } from "../types/TJobSearchMonth"
import type { TApplicationsTone } from "../types/TApplicationsTone"
import { getApplicationsStatusTone } from "../utils/getApplicationsStatusTone"

/** STATIC class strings — do NOT interpolate the tone into className (Tailwind would purge it). */
const toneClassNameMap: Record<TApplicationsTone, string> = {
  danger: "border-danger/40 bg-danger/10 text-danger",
  warning: "border-warning/40 bg-warning/10 text-warning",
  success: "border-success/40 bg-success/10 text-success",
}

/** Converts "2026-04" → "04.2026" */
function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-")
  return `${monthNumber}.${year}`
}

function MetricBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className="mt-[2px] text-lg text-secondary">{value}</p>
    </div>
  )
}

export function JobSearchMonthCard({ month }: { month: TJobSearchMonth }) {
  const t = useScopedI18n("admin")
  const tone = getApplicationsStatusTone(month.applications)
  const toneClassName = toneClassNameMap[tone]
  const toneLabel =
    tone === "danger" ? t("appsBelowTarget") : tone === "warning" ? t("appsOnTrack") : t("appsStrong")

  return (
    <article className="rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-sm flex items-center justify-between gap-[4px]">
        <h3 className="text-sm uppercase tracking-[0.18em] text-secondary">{formatMonthLabel(month.month)}</h3>
        <div className="flex items-center gap-[4px]">
          {month.conversionRate !== null && (
            <span className="inline-flex shrink-0 rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-[2px] text-xs text-secondary-foreground">
              {month.conversionRate}%
            </span>
          )}
          <span className={`inline-flex shrink-0 rounded-[2px] border px-sm py-[2px] text-xs ${toneClassName}`}>
            {toneLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[4px]">
        <MetricBlock label={t("appointments")} value={month.appointments} />
        <div className={`rounded-[2px] border px-sm py-xs ${toneClassName}`}>
          <p className="text-xs uppercase tracking-[0.15em]">{t("amountApplies")}</p>
          <p className="mt-[2px] flex items-start gap-[6px]">
            <span className="text-lg">{month.amountApplies}</span>
            <span className="mt-[4px] text-xs opacity-70">+{month.applications}</span>
          </p>
        </div>
      </div>
    </article>
  )
}
