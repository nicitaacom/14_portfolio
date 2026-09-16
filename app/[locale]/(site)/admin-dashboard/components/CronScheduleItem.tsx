"use client"

import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import type { TCronScheduleRow } from "../types/TCronScheduleRow"
import { formatDateTime } from "../utils/adminFormatters"
import { adminUi } from "./AdminUI"

export function CronScheduleItem({ job }: { job: TCronScheduleRow }) {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const hasRuns = job.total_runs > 0 || !!job.last_run_at || !!job.last_run_status
  const tone = job.last_run_status === "success" ? "success" : job.last_run_status === "failed" ? "danger" : "neutral"
  const lastStatus = job.last_run_status === "success" ? t("success") : job.last_run_status === "failed" ? t("failed") : job.last_run_status ?? t("unknownStatus")

  return (
    <article className={adminUi.panel}>
      <header className={adminUi.panelHeader}>
        <h3 className={adminUi.heading}>{job.job_name}</h3>
        <span className={`${adminUi.badge} ${job.is_active ? "border-[var(--3d-dot-c-415b4e)] bg-[var(--3d-dot-c-20322a)] text-[var(--3d-dot-c-a7c8b6)]" : ""}`}>{job.is_active ? t("active") : t("paused")}</span>
      </header>
      {job.description && <p className={adminUi.muted}>{job.description}</p>}
      <dl className="mt-sm grid grid-cols-[90px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[11px] [&_dt]:text-[var(--3d-dot-c-95a7b5)] [&_dd]:min-w-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-[var(--3d-dot-c-c6d6e2)]">
        <div className="contents"><dt>{t("schedule")}</dt><dd className={adminUi.mono}>{job.schedule}</dd></div>
        <div className="contents"><dt>{t("lastRun")}</dt><dd>{formatDateTime(job.last_run_at, t("noRunsYet"), locale)}</dd></div>
        <div className="contents"><dt>{t("lastStatus")}</dt><dd><span className={`${adminUi.badge} ${hasRuns && tone === "success" ? "border-[var(--3d-dot-c-415b4e)] bg-[var(--3d-dot-c-20322a)] text-[var(--3d-dot-c-a7c8b6)]" : hasRuns && tone === "danger" ? "border-[var(--3d-dot-c-76504e)] bg-[var(--3d-dot-c-382829)] text-[var(--3d-dot-c-e0aaa6)]" : ""}`}>{hasRuns ? lastStatus : t("firstRunPending")}</span></dd></div>
        <div className="contents"><dt>{t("runs")}</dt><dd>{job.total_runs}</dd></div>
      </dl>
      <details className="mt-sm border-t border-[var(--3d-dot-c-3c454d)] pt-sm text-[11px] text-[var(--3d-dot-c-a7b4bf)]">
        <summary className="cursor-pointer text-[var(--3d-dot-c-b8c5cf)]">{t("command")}</summary>
        <pre className="mt-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{job.command}</pre>
      </details>
    </article>
  )
}
