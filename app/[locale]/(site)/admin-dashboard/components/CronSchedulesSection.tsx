"use client"

import Image from "next/image"
import { useScopedI18n } from "@/locales/client"
import type { TCronScheduleRow } from "../types/TCronScheduleRow"
import { DashboardCard } from "./DashboardCard"
import { CronScheduleItem } from "./CronScheduleItem"

export function CronSchedulesSection({ cronSchedules }: { cronSchedules: TCronScheduleRow[] }) {
  const t = useScopedI18n("admin")

  return (
    <DashboardCard title={t("cronSchedules")} subtitle={t("cronSchedulesSubtitle")}>
      {cronSchedules.length === 0 ? (
        <div className="flex flex-col items-center gap-sm py-lg">
          <Image src="/cron-jobs.png" alt="No cron schedules" width={120} height={120} className="opacity-50" />
          <p className="text-sm text-secondary-foreground">{t("noCronSchedulesYet")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[4px]">
          {cronSchedules.map(job => (
            <CronScheduleItem key={job.id} job={job} />
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
