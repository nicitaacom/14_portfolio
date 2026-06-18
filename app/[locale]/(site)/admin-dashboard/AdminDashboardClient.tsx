"use client"

import { useEffect, useState } from "react"
import { useScopedI18n } from "@/locales/client"
import type { TBookingRow } from "./types/TBookingRow"
import type { TCronScheduleRow } from "./types/TCronScheduleRow"
import { OverviewStat } from "./components/OverviewStat"
import { JobSearchDashboardSection } from "./components/JobSearchDashboardSection"
import { ProjectClicksDashboardSection } from "./components/ProjectClicksDashboardSection"
import { UTMStatsDashboardSection } from "./components/UTMStatsDashboardSection"
import { BookedAppointmentsSection } from "./components/BookedAppointmentsSection"
import { CronSchedulesSection } from "./components/CronSchedulesSection"

interface AdminDashboardClientProps {
  bookings: TBookingRow[]
  cronSchedules: TCronScheduleRow[]
  userId: string
}

type TActiveTab = "utm" | "projectClick" | "jobSearch"

const STORAGE_KEY = "admin-dashboard-active-tab"

function isValidTab(value: unknown): value is TActiveTab {
  return value === "utm" || value === "projectClick" || value === "jobSearch"
}

export function AdminDashboardClient({ bookings, cronSchedules, userId }: AdminDashboardClientProps) {
  const t = useScopedI18n("admin")
  const [activeTab, setActiveTab] = useState<TActiveTab>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return isValidTab(stored) ? stored : "utm"
    } catch {
      return "utm"
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeTab)
    } catch {
      // localStorage unavailable (private browsing, storage full)
    }
  }, [activeTab])

  const activeCronJobs = cronSchedules.filter(job => job.is_active).length
  const failedCronJobs = cronSchedules.filter(job => job.last_run_status === "failed").length

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#191919] px-sm py-sm tablet:px-md tablet:py-md">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[4px]">
        <section className="rounded-[2px] border border-[#323232] bg-[#242424] px-sm py-sm shadow-[0_24px_70px_rgba(0,0,0,0.32)] tablet:px-md tablet:py-md">
          <div className="flex flex-col gap-[4px] laptop:flex-row laptop:items-end laptop:justify-between">
            <div className="flex flex-col gap-[4px]">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">{t("panel")}</p>
              <h1 className="text-lg text-secondary">{t("headerTitle")}</h1>
              <p className="max-w-[720px] text-xs tablet:text-sm">
                {t("headerSubtitle", { userId })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-[4px] laptop:grid-cols-4">
              <OverviewStat label={t("cronJobs")} value={cronSchedules.length} />
              <OverviewStat label={t("activeJobs")} value={activeCronJobs} />
              <OverviewStat label={t("failedLastRun")} value={failedCronJobs} />
              <OverviewStat label={t("bookings")} value={bookings.length} />
            </div>
          </div>
        </section>

        <section className="mt-sm rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="flex flex-wrap gap-[4px]">
            <button
              type="button"
              className={`rounded-[2px] border px-[10px] py-[8px] text-sm transition ${
                activeTab === "utm"
                  ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
                  : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
              }`}
              onClick={() => setActiveTab("utm")}>
              {t("utm")}
            </button>
            <button
              type="button"
              className={`rounded-[2px] border px-[10px] py-[8px] text-sm transition ${
                activeTab === "projectClick"
                  ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
                  : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
              }`}
              onClick={() => setActiveTab("projectClick")}>
              {t("projectClick")}
            </button>
            <button
              type="button"
              className={`rounded-[2px] border px-[10px] py-[8px] text-sm transition ${
                activeTab === "jobSearch"
                  ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
                  : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
              }`}
              onClick={() => setActiveTab("jobSearch")}>
              {t("jobSearch")}
            </button>
          </div>
        </section>

        <div className="mt-sm">
          {activeTab === "utm" && <UTMStatsDashboardSection />}
          {activeTab === "projectClick" && <ProjectClicksDashboardSection />}
          {activeTab === "jobSearch" && <JobSearchDashboardSection />}
        </div>

        <div className="mt-sm grid gap-[4px] desktop:grid-cols-[1.2fr_0.8fr]">
          <CronSchedulesSection cronSchedules={cronSchedules} />
          <BookedAppointmentsSection bookings={bookings} />
        </div>
      </div>
    </div>
  )
}
