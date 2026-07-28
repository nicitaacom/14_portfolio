"use client"

import { useScopedI18n } from "@/locales/client"
import type { TCronScheduleRow } from "../types/TCronScheduleRow"
import { MetaPill } from "./MetaPill"
import { StatusBadge } from "./StatusBadge"
import { formatDateTime } from "../utils/adminFormatters"

export function CronScheduleItem({ job }: { job: TCronScheduleRow }) {
  const t = useScopedI18n("admin")
  const hasRuns = job.total_runs > 0 || !!job.last_run_at || !!job.last_run_status
  const descriptionText = job.description ? job.description : `Command: ${job.command}`

  return (
    <article className="rounded-[2px] border border-brass/40 bg-steel px-sm py-sm">
      <div className="flex flex-col gap-[4px]">
        <div className="flex flex-col gap-[4px] tablet:flex-row tablet:items-start tablet:justify-between">
          <div className="min-w-0 flex items-center gap-xs">
            <p className="truncate whitespace-nowrap text-sm text-secondary" title={job.job_name}>
              {job.job_name}
            </p>
            <StatusBadge label={job.is_active ? t("active") : t("paused")} tone={job.is_active ? "green" : "gray"} />
          </div>

          <div className="admin-dashboard-scrollbar -mx-[2px] overflow-x-auto">
            <div className="flex min-w-max gap-[4px] px-[4px]">
              <MetaPill className="text-secondary">{job.schedule}</MetaPill>
              {hasRuns ? (
                <>
                  <MetaPill>{formatDateTime(job.last_run_at, t("noRunsYet"))}</MetaPill>
                  <StatusBadge
                    label={job.last_run_status ?? t("noRunsYet")}
                    tone={
                      job.last_run_status === "success" ? "green" : job.last_run_status === "failed" ? "red" : "gray"
                    }
                  />
                  <MetaPill className="text-secondary">
                    {job.total_runs} {t("runs")}
                  </MetaPill>
                </>
              ) : (
                <MetaPill className="border-warning/40 bg-warning/10 text-warning">{t("firstRunPending")}</MetaPill>
              )}
            </div>
          </div>
        </div>

        <p className="truncate whitespace-nowrap text-xs" title={descriptionText}>
          {descriptionText}
        </p>
        <p className="truncate whitespace-nowrap font-mono text-xs text-secondary-foreground" title={job.command}>
          {job.command}
        </p>
      </div>
    </article>
  )
}
