"use client"

import { useMemo } from "react"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

interface BookingRow {
  booking_date: string
  booking_time_MSK: string
  channel: string
  created_at: string
  id: string
  user_cookie_id: string
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

function formatDateTime(value: string | null) {
  if (!value) return "No runs yet"
  return dateTimeFormatter.format(new Date(value))
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function OverviewStat({ label, value }: OverviewStatProps) {
  return (
    <div className="rounded-[16px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className="mt-[2px] text-lg text-secondary">{value}</p>
    </div>
  )
}

function MetaPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full border border-[#3a3a3a] bg-[#262626] px-sm py-[2px] text-xs ${className}`}>{children}</span>
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

  return <span className={`inline-flex shrink-0 rounded-full border px-sm py-[2px] text-xs ${toneClassName}`}>{label}</span>
}

function BookingChannelBadge({ channel }: { channel: string }) {
  if (channel === "telegram") {
    return (
      <span className="inline-flex items-center gap-[6px] rounded-full border border-[#2AABEE]/40 bg-[#2AABEE]/10 px-sm py-[2px] text-xs text-[#2AABEE]">
        <FaTelegramPlane size={12} />
        telegram
      </span>
    )
  }

  if (channel === "discord") {
    return (
      <span className="inline-flex items-center gap-[6px] rounded-full border border-[#5865F2]/40 bg-[#1f255d] px-sm py-[2px] text-xs text-[#8ea2ff]">
        <FaDiscord size={12} />
        discord
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-[6px] rounded-full border border-[#5f6368] bg-[#2a2d31] px-sm py-[2px] text-xs text-[#e8eaed]">
      <FcGoogle size={12} />
      google-meets
    </span>
  )
}

function CronScheduleItem({ job }: { job: CronScheduleRow }) {
  const hasRuns = job.total_runs > 0 || !!job.last_run_at || !!job.last_run_status
  const descriptionText = job.description ? job.description : `Command: ${job.command}`

  return (
    <article className="rounded-[14px] border border-[#343434] bg-[#202020] px-sm py-sm">
      <div className="flex flex-col gap-xs">
        <div className="flex flex-col gap-xs tablet:flex-row tablet:items-start tablet:justify-between">
          <div className="min-w-0 flex items-center gap-xs">
            <p className="truncate whitespace-nowrap text-sm text-secondary" title={job.job_name}>
              {job.job_name}
            </p>
            <StatusBadge label={job.is_active ? "active" : "paused"} tone={job.is_active ? "green" : "gray"} />
          </div>

          <div className="admin-dashboard-scrollbar -mx-[2px] overflow-x-auto">
            <div className="flex min-w-max gap-xs px-[2px]">
              <MetaPill className="text-secondary">{job.schedule}</MetaPill>
              {hasRuns ? (
                <>
                  <MetaPill>{formatDateTime(job.last_run_at)}</MetaPill>
                  <StatusBadge
                    label={job.last_run_status ?? "unknown"}
                    tone={
                      job.last_run_status === "success"
                        ? "green"
                        : job.last_run_status === "failed"
                          ? "red"
                          : "gray"
                    }
                  />
                  <MetaPill className="text-secondary">{job.total_runs} runs</MetaPill>
                </>
              ) : (
                <MetaPill className="border-warning/40 bg-warning/10 text-warning">first run pending</MetaPill>
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
  return (
    <article className="rounded-[14px] border border-[#343434] bg-[#202020] p-sm">
      <div className="flex flex-col gap-xs">
        <div className="flex flex-col gap-xs tablet:flex-row tablet:items-start tablet:justify-between">
          <div className="min-w-0">
            <p className="truncate whitespace-nowrap text-sm text-secondary" title={`${formatDate(booking.booking_date)} at ${booking.booking_time_MSK}`}>
              {formatDate(booking.booking_date)} at {booking.booking_time_MSK}
            </p>
            <p className="truncate whitespace-nowrap text-xs" title={formatDateTime(booking.created_at)}>
              Created {formatDateTime(booking.created_at)}
            </p>
          </div>
          <BookingChannelBadge channel={booking.channel} />
        </div>

        <div className="grid gap-xs">
          <DetailRow label="Booking ID" value={booking.id} mono />
          <DetailRow label="Cookie user" value={booking.user_cookie_id} mono />
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
    <section className={`rounded-[18px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="mb-sm flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{title}</h2>
        {subtitle && <p className="text-xs">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

export function AdminDashboardClient({ bookings, cronSchedules, userId }: AdminDashboardClientProps) {
  const stats = useMemo(() => {
    const activeCronJobs = cronSchedules.filter(job => job.is_active).length
    const failedCronJobs = cronSchedules.filter(job => job.last_run_status === "failed").length
    const upcomingBookings = bookings.filter(booking => new Date(`${booking.booking_date}T${booking.booking_time_MSK}`) >= new Date()).length

    return {
      activeCronJobs,
      failedCronJobs,
      totalBookings: bookings.length,
      totalCronJobs: cronSchedules.length,
      upcomingBookings,
    }
  }, [bookings, cronSchedules])

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#191919] px-sm py-sm tablet:px-md tablet:py-md">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-sm tablet:gap-md">
        <section className="rounded-[20px] border border-[#323232] bg-[#242424] px-sm py-sm shadow-[0_24px_70px_rgba(0,0,0,0.32)] tablet:px-md tablet:py-md">
          <div className="flex flex-col gap-sm laptop:flex-row laptop:items-end laptop:justify-between">
            <div className="flex flex-col gap-[4px]">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">Admin dashboard</p>
              <h1 className="text-lg text-secondary">Cron jobs and booked appointments</h1>
              <p className="max-w-[720px] text-xs tablet:text-sm">
                Fresh server auth check passed for admin user <span className="text-secondary">{userId}</span>. This page reads cron schedules from the
                RPC and all rows from the <span className="text-secondary">bookings</span> table.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-xs tablet:gap-sm laptop:grid-cols-4">
              <OverviewStat label="Cron jobs" value={stats.totalCronJobs} />
              <OverviewStat label="Active jobs" value={stats.activeCronJobs} />
              <OverviewStat label="Failed last run" value={stats.failedCronJobs} />
              <OverviewStat label="Bookings" value={stats.totalBookings} />
            </div>
          </div>
        </section>

        <div className="grid gap-sm tablet:gap-md desktop:grid-cols-[1.2fr_0.8fr]">
          <DashboardCard title="Cron schedules" subtitle="Compact live view of every pg_cron job configured for this project.">
            <div className="flex flex-col gap-xs">
              {cronSchedules.map(job => (
                <CronScheduleItem key={job.id} job={job} />
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Booked appointments" subtitle="Every booking row with channel badges and identifiers in a compact scrollable list.">
            <div className="mb-sm grid grid-cols-2 gap-xs tablet:gap-sm">
              <OverviewStat label="Upcoming" value={stats.upcomingBookings} />
              <OverviewStat label="All rows" value={bookings.length} />
            </div>

            <div className="admin-dashboard-scrollbar max-h-[860px] overflow-auto pr-xs">
              <div className="flex flex-col gap-xs">
                {bookings.map(booking => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
