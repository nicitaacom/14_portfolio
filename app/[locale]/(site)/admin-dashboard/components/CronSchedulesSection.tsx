"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useScopedI18n } from "@/locales/client"
import type { TCronScheduleRow } from "../types/TCronScheduleRow"
import { CronScheduleItem } from "./CronScheduleItem"
import { adminUi, RefreshButton } from "./AdminUI"

export function CronSchedulesSection({ cronSchedules, loadError = false }: { cronSchedules: TCronScheduleRow[]; loadError?: boolean }) {
  const t = useScopedI18n("adminConsole")
  const router = useRouter()
  const [refreshing, startRefresh] = useTransition()

  return (
    <div className={adminUi.stack}>
      <div className={adminUi.toolbar}>
        <p className={adminUi.muted}>{t("cronSchedulesSubtitle")}</p>
        <RefreshButton pending={refreshing} onClick={() => startRefresh(() => router.refresh())} />
      </div>
      {loadError ? <p className={adminUi.error} role="alert">{t("schedulesLoadFailed")}</p> : (
        <>
          <dl className={`${adminUi.metrics} laptop:grid-cols-3`}>
            {[["cronJobs", cronSchedules.length], ["activeJobs", cronSchedules.filter(job => job.is_active).length], ["failedLastRun", cronSchedules.filter(job => job.last_run_status === "failed").length]].map(([label, value]) => <div key={String(label)}><dt className="font-typewriter text-[10px] uppercase tracking-[1px] text-[var(--3d-dot-c-a8b1b9)]">{t(label as "cronJobs")}</dt><dd className="mt-xs text-[25px] leading-tight text-[var(--3d-dot-c-eff3f6)] tablet:text-[31px]">{value}</dd></div>)}
          </dl>
          <div className={adminUi.stack} aria-busy={refreshing}>
            {cronSchedules.length ? cronSchedules.map(job => <CronScheduleItem key={job.id} job={job} />) : (
              <p className={adminUi.empty}>{t("noCronSchedulesYet")}</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
