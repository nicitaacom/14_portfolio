"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FaDiscord, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa"
import { FiEdit3, FiMail, FiSave } from "react-icons/fi"
import { MdOutlineCancel } from "react-icons/md"
import { SiGooglemeet } from "react-icons/si"
import Image from "next/image"
import { Input } from "@/components/Input"
import { useBookingActions } from "../hooks/useBookingActions"
import { JobSearchDashboardSection } from "./components/JobSearchDashboardSection"
import { ProjectClicksDashboardSection } from "./components/ProjectClicksDashboardSection"
import { UTMStatsDashboardSection } from "./components/UTMStatsDashboardSection"
import { useScopedI18n } from "@/locales/client"

interface BookingRow {
  booking_date: string
  booking_time_MSK: string
  channel: string
  contact?: string | null
  contact_type?: string | null
  created_at: string
  id: string
}

interface CronScheduleRow {
  command: string
  created_at: string
  description: string | null
  id: number
  is_active: boolean
  job_name: string
  last_run_at: string | null
  last_run_status: string | null
  schedule: string
  total_runs: number
  updated_at: string
}

interface AdminDashboardClientProps {
  bookings: BookingRow[]
  cronSchedules: CronScheduleRow[]
  userId: string
}

interface OverviewStatProps {
  label: string
  value: number
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
})

function formatDateTime(value: string | null, emptyValue = "") {
  if (!value) return emptyValue
  return dateTimeFormatter.format(new Date(value))
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function OverviewStat({ label, value }: OverviewStatProps) {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className="mt-[2px] text-lg text-secondary">{value}</p>
    </div>
  )
}

function MetaPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[2px] border border-[#3a3a3a] bg-[#262626] px-sm py-[2px] text-xs ${className}`}>
      {children}
    </span>
  )
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[84px_1fr] items-center gap-xs text-xs">
      <span className="truncate whitespace-nowrap uppercase tracking-[0.14em] text-secondary-foreground">{label}</span>
      <span className={`truncate whitespace-nowrap text-secondary ${mono ? "font-mono" : ""}`} title={value}>
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: "green" | "red" | "gray" | "blue" }) {
  const toneClassName =
    tone === "green"
      ? "border-success/40 bg-success/10 text-success"
      : tone === "red"
        ? "border-danger/40 bg-danger/10 text-danger"
        : tone === "blue"
          ? "border-info/40 bg-info/10 text-info"
          : "border-secondary-foreground/30 bg-secondary-foreground/10 text-secondary"

  return (
    <span className={`inline-flex shrink-0 rounded-[2px] border px-sm py-[2px] text-xs ${toneClassName}`}>{label}</span>
  )
}

function BookingChannelBadge({ channel }: { channel: string }) {
  const commonT = useScopedI18n("common")

  if (channel === "telegram") {
    return (
      <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#2AABEE]/40 bg-[#102d3c] px-sm py-[2px] text-xs text-[#7fd3ff]">
        <FaTelegramPlane size={12} />
        {commonT("telegram")}
      </span>
    )
  }

  if (channel === "discord") {
    return (
      <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#5865F2]/40 bg-[#1c214c] px-sm py-[2px] text-xs text-[#a9b8ff]">
        <FaDiscord size={12} />
        {commonT("discord")}
      </span>
    )
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#4b4f56] bg-[#2a2d31] px-sm py-[2px] text-xs text-[#f1f3f4]">
      <SiGooglemeet className="text-[#34A853]" size={12} />
      {commonT("googleMeets")}
    </span>
  )
}

function BookingContactRow({
  contact,
  contactType,
}: {
  contact: string | null | undefined
  contactType: string | null | undefined
}) {
  const t = useScopedI18n("admin")
  const contactValue = contact ?? t("notProvided")

  const ContactIcon =
    contactType === "telegram"
      ? FaTelegramPlane
      : contactType === "discord"
        ? FaDiscord
        : contactType === "linkedin"
          ? FaLinkedinIn
          : FiMail

  const iconClassName =
    contactType === "telegram"
      ? "text-[#2AABEE]"
      : contactType === "discord"
        ? "text-[#8ea2ff]"
        : contactType === "linkedin"
          ? "text-[#0A66C2]"
          : "text-[#d6d8db]"

  return (
    <div className="flex items-center gap-xs overflow-hidden text-xs">
      <ContactIcon className={`shrink-0 ${iconClassName}`} size={13} />
      <p className="truncate whitespace-nowrap text-secondary" title={`${t("contact")}: ${contactValue}`}>
        {t("contact")}: {contactValue}
      </p>
    </div>
  )
}

function BookingControlChip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-[40px] shrink-0 items-center rounded-[2px] border border-[#343434] bg-[#232323] px-sm ${className}`}>
      {children}
    </div>
  )
}

function CronScheduleItem({ job }: { job: CronScheduleRow }) {
  const t = useScopedI18n("admin")
  const hasRuns = job.total_runs > 0 || !!job.last_run_at || !!job.last_run_status
  const descriptionText = job.description ? job.description : `Command: ${job.command}`

  return (
    <article className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-sm">
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

function BookingItem({ booking }: { booking: BookingRow }) {
  const t = useScopedI18n("admin")
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [draftBookingDate, setDraftBookingDate] = useState(booking.booking_date)
  const [draftBookingTime, setDraftBookingTime] = useState(booking.booking_time_MSK.slice(0, 5))

  const { isLoading, deleteBooking, updateBooking } = useBookingActions({
    onDeleteSuccess: () => router.refresh(),
    onUpdateSuccess: () => { setIsEditing(false); router.refresh() },
  })

  function saveBookingChanges() {
    updateBooking(booking.id, draftBookingDate, draftBookingTime, formatDate(booking.booking_date), booking.booking_time_MSK)
  }

  function handleDelete() {
    deleteBooking(booking.id, formatDate(booking.booking_date), booking.booking_time_MSK)
  }

  return (
    <article className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-sm">
      <div className="flex flex-col gap-[4px]">
        <div className="admin-dashboard-scrollbar overflow-x-auto pb-[4px]">
          <div className="flex min-w-max items-center gap-[4px]">
            <BookingControlChip className="w-[152px] justify-between">
              {isEditing ? (
                <Input
                  type="date"
                  value={draftBookingDate}
                  onChange={event => setDraftBookingDate(event.target.value)}
                  className="w-full border-none px-0 py-0"
                />
              ) : (
                <p className="truncate whitespace-nowrap text-sm text-secondary">{formatDate(booking.booking_date)}</p>
              )}
            </BookingControlChip>

            <BookingControlChip className="w-[128px] justify-between">
              {isEditing ? (
                <Input
                  type="time"
                  value={draftBookingTime}
                  onChange={event => setDraftBookingTime(event.target.value)}
                  className="w-full border-none px-0 py-0"
                />
              ) : (
                <p className="truncate whitespace-nowrap text-sm text-secondary">
                  {booking.booking_time_MSK.slice(0, 5)} MSK
                </p>
              )}
            </BookingControlChip>

            <BookingControlChip>
              <BookingChannelBadge channel={booking.channel} />
            </BookingControlChip>

            {isEditing ? (
              <>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-success/40 bg-[#14281a] text-success transition-opacity disabled:opacity-50"
                  disabled={isLoading || !draftBookingDate || !draftBookingTime}
                  onClick={saveBookingChanges}
                  type="button">
                  <FiSave size={16} />
                </button>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-secondary-foreground/30 bg-[#2b2b2b] text-secondary transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => setIsEditing(false)}
                  type="button">
                  <MdOutlineCancel size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-cta/40 bg-[#2f203d] text-cta transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => setIsEditing(true)}
                  type="button">
                  <FiEdit3 size={16} />
                </button>
                <button
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[2px] border border-danger/40 bg-[#321b1f] text-danger transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                  onClick={handleDelete}
                  type="button">
                  <MdOutlineCancel size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-[#2e2e2e]"></div>

        <div className="flex flex-col gap-[4px] pt-[4px]">
          <p className="truncate whitespace-nowrap text-xs" title={formatDateTime(booking.created_at)}>
            {t("created")} {formatDateTime(booking.created_at)}
          </p>
          <DetailRow label={t("bookingId")} value={booking.id} mono />
          <BookingContactRow contact={booking.contact} contactType={booking.contact_type} />
        </div>
      </div>
    </article>
  )
}

function DashboardCard({
  children,
  subtitle,
  className = "",
  title,
}: {
  children: React.ReactNode
  className?: string
  subtitle?: string
  title: string
}) {
  return (
    <section
      className={`rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="mb-[4px] flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{title}</h2>
        {subtitle && <p className="text-xs">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

type TActiveTab = "utm" | "projectClick" | "jobSearch"

const STORAGE_KEY = "admin-dashboard-active-tab"

function isValidTab(value: unknown): value is TActiveTab {
  return value === "utm" || value === "projectClick" || value === "jobSearch"
}

type TBookingsView = "upcoming" | "past"

export function AdminDashboardClient({ bookings, cronSchedules, userId }: AdminDashboardClientProps) {
  const [bookingsView, setBookingsView] = useState<TBookingsView>("upcoming")
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
  const t = useScopedI18n("admin")
  const stats = useMemo(() => {
    const now = new Date()
    const activeCronJobs = cronSchedules.filter(job => job.is_active).length
    const failedCronJobs = cronSchedules.filter(job => job.last_run_status === "failed").length
    const upcomingBookings = bookings.filter(
      booking => new Date(`${booking.booking_date}T${booking.booking_time_MSK}`) >= now,
    )
    const pastBookings = bookings
      .filter(booking => new Date(`${booking.booking_date}T${booking.booking_time_MSK}`) < now)
      .sort((a, b) =>
        new Date(`${b.booking_date}T${b.booking_time_MSK}`).getTime() -
        new Date(`${a.booking_date}T${a.booking_time_MSK}`).getTime(),
      )

    return {
      activeCronJobs,
      failedCronJobs,
      totalCronJobs: cronSchedules.length,
      upcomingBookings,
      pastBookings,
      totalBookings: bookings.length,
    }
  }, [bookings, cronSchedules])

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
              <OverviewStat label={t("cronJobs")} value={stats.totalCronJobs} />
              <OverviewStat label={t("activeJobs")} value={stats.activeCronJobs} />
              <OverviewStat label={t("failedLastRun")} value={stats.failedCronJobs} />
              <OverviewStat label={t("bookings")} value={stats.totalBookings} />
            </div>
          </div>
        </section>

        <section className="mt-sm rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="flex flex-col gap-[4px] laptop:flex-row laptop:items-center laptop:justify-between">
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
          </div>
        </section>

        <div className="mt-sm">
          {activeTab === "utm" && <UTMStatsDashboardSection />}
          {activeTab === "projectClick" && <ProjectClicksDashboardSection />}
          {activeTab === "jobSearch" && <JobSearchDashboardSection />}
        </div>

        <div className="mt-sm grid gap-[4px] desktop:grid-cols-[1.2fr_0.8fr]">
          <DashboardCard
            title={t("cronSchedules")}
            subtitle={t("cronSchedulesSubtitle")}>
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

          <DashboardCard
            title={t("bookedAppointments")}
            subtitle={t("bookedAppointmentsSubtitle")}>
            <div className="mb-[4px] grid grid-cols-3 gap-[4px]">
              <OverviewStat label={t("upcoming")} value={stats.upcomingBookings.length} />
              <OverviewStat label={t("past")} value={stats.pastBookings.length} />
              <OverviewStat label={t("total")} value={stats.totalBookings} />
            </div>

            <div className="mb-[4px] flex gap-[4px]">
              <button
                type="button"
                className={`rounded-[2px] border px-[10px] py-[6px] text-xs transition ${
                  bookingsView === "upcoming"
                    ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
                    : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
                }`}
                onClick={() => setBookingsView("upcoming")}>
                {t("upcoming")}
              </button>
              <button
                type="button"
                className={`rounded-[2px] border px-[10px] py-[6px] text-xs transition ${
                  bookingsView === "past"
                    ? "border-[#4a4a4a] bg-[#2a2a2a] text-secondary"
                    : "border-[#343434] bg-[#1f1f1f] text-secondary-foreground"
                }`}
                onClick={() => setBookingsView("past")}>
                {t("past")}
              </button>
            </div>

            <div className="admin-dashboard-scrollbar max-h-[860px] overflow-auto pr-xs">
              <div className="flex flex-col gap-[4px]">
                {bookingsView === "upcoming"
                  ? stats.upcomingBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)
                  : stats.pastBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)
                }
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
