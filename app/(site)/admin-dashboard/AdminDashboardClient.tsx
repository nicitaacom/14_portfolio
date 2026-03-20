"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FaDiscord, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa"
import { FiEdit3, FiMail, FiSave } from "react-icons/fi"
import { MdOutlineCancel } from "react-icons/md"
import { SiGooglemeet } from "react-icons/si"
import { deleteDBAppointmentAction } from "@/(site)/actions/deleteDBAppointmentAction"
import { updateDBAppointmentAction } from "@/(site)/actions/updateDBAppointmentAction"
import { Input } from "@/components/Input"

interface BookingRow {
  booking_date: string
  booking_time_MSK: string
  channel: string
  contact: string | null
  contact_type: string | null
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

function formatDateTime(value: string | null) {
  if (!value) return "No runs yet"
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
  return <span className={`inline-flex shrink-0 items-center rounded-[2px] border border-[#3a3a3a] bg-[#262626] px-sm py-[2px] text-xs ${className}`}>{children}</span>
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

  return <span className={`inline-flex shrink-0 rounded-[2px] border px-sm py-[2px] text-xs ${toneClassName}`}>{label}</span>
}

function BookingChannelBadge({ channel }: { channel: string }) {
  if (channel === "telegram") {
    return (
      <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#2AABEE]/40 bg-[#102d3c] px-sm py-[2px] text-xs text-[#7fd3ff]">
        <FaTelegramPlane size={12} />
        telegram
      </span>
    )
  }

  if (channel === "discord") {
    return (
      <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#5865F2]/40 bg-[#1c214c] px-sm py-[2px] text-xs text-[#a9b8ff]">
        <FaDiscord size={12} />
        discord
      </span>
    )
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#4b4f56] bg-[#2a2d31] px-sm py-[2px] text-xs text-[#f1f3f4]">
      <SiGooglemeet className="text-[#34A853]" size={12} />
      google-meets
    </span>
  )
}

function BookingContactRow({ contact, contactType }: { contact: string | null; contactType: string | null }) {
  const contactValue = contact ?? "not provided"

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
      <p className="truncate whitespace-nowrap text-secondary" title={`Contact: ${contactValue}`}>
        Contact: {contactValue}
      </p>
    </div>
  )
}

function BookingControlChip({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex h-[40px] shrink-0 items-center rounded-[2px] border border-[#343434] bg-[#232323] px-sm ${className}`}>
      {children}
    </div>
  )
}

function CronScheduleItem({ job }: { job: CronScheduleRow }) {
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
            <StatusBadge label={job.is_active ? "active" : "paused"} tone={job.is_active ? "green" : "gray"} />
          </div>

          <div className="admin-dashboard-scrollbar -mx-[2px] overflow-x-auto">
            <div className="flex min-w-max gap-[4px] px-[4px]">
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftBookingDate, setDraftBookingDate] = useState(booking.booking_date)
  const [draftBookingTime, setDraftBookingTime] = useState(booking.booking_time_MSK.slice(0, 5))

  async function saveBookingChanges() {
    try {
      setIsLoading(true)
      await updateDBAppointmentAction(
        booking.id,
        draftBookingDate,
        draftBookingTime,
        formatDate(booking.booking_date),
        booking.booking_time_MSK,
      )
      setIsEditing(false)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteBooking() {
    try {
      setIsLoading(true)
      await deleteDBAppointmentAction(booking.id, formatDate(booking.booking_date), booking.booking_time_MSK)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-sm">
      <div className="flex flex-col gap-[4px]">
        <div className="admin-dashboard-scrollbar overflow-x-auto pb-[4px]">
          <div className="flex min-w-max items-center gap-[4px]">
            <BookingControlChip className="w-[152px] justify-between">
              {isEditing ? (
                <Input type="date" value={draftBookingDate} onChange={event => setDraftBookingDate(event.target.value)} className="w-full border-none px-0 py-0" />
              ) : (
                <p className="truncate whitespace-nowrap text-sm text-secondary">{formatDate(booking.booking_date)}</p>
              )}
            </BookingControlChip>

            <BookingControlChip className="w-[128px] justify-between">
              {isEditing ? (
                <Input type="time" value={draftBookingTime} onChange={event => setDraftBookingTime(event.target.value)} className="w-full border-none px-0 py-0" />
              ) : (
                <p className="truncate whitespace-nowrap text-sm text-secondary">{booking.booking_time_MSK.slice(0, 5)}</p>
              )}
            </BookingControlChip>

            <div className="flex h-[40px] shrink-0 items-center px-[4px]">
              <BookingChannelBadge channel={booking.channel} />
            </div>

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
                  onClick={deleteBooking}
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
            Created {formatDateTime(booking.created_at)}
          </p>
          <DetailRow label="Booking ID" value={booking.id} mono />
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
    <section className={`rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="mb-[4px] flex flex-col gap-[4px]">
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
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[4px]">
        <section className="rounded-[2px] border border-[#323232] bg-[#242424] px-sm py-sm shadow-[0_24px_70px_rgba(0,0,0,0.32)] tablet:px-md tablet:py-md">
          <div className="flex flex-col gap-[4px] laptop:flex-row laptop:items-end laptop:justify-between">
            <div className="flex flex-col gap-[4px]">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">Admin dashboard</p>
              <h1 className="text-lg text-secondary">Cron jobs and booked appointments</h1>
              <p className="max-w-[720px] text-xs tablet:text-sm">
                Fresh server auth check passed for admin user <span className="text-secondary">{userId}</span>. This page reads cron schedules from the
                RPC and all rows from the <span className="text-secondary">bookings</span> table.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-[4px] laptop:grid-cols-4">
              <OverviewStat label="Cron jobs" value={stats.totalCronJobs} />
              <OverviewStat label="Active jobs" value={stats.activeCronJobs} />
              <OverviewStat label="Failed last run" value={stats.failedCronJobs} />
              <OverviewStat label="Bookings" value={stats.totalBookings} />
            </div>
          </div>
        </section>

        <div className="grid gap-[4px] desktop:grid-cols-[1.2fr_0.8fr]">
          <DashboardCard title="Cron schedules" subtitle="Compact live view of every pg_cron job configured for this project.">
            <div className="flex flex-col gap-[4px]">
              {cronSchedules.map(job => (
                <CronScheduleItem key={job.id} job={job} />
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Booked appointments" subtitle="Every booking row with channel badges and identifiers in a compact scrollable list.">
            <div className="mb-[4px] grid grid-cols-2 gap-[4px]">
              <OverviewStat label="Upcoming" value={stats.upcomingBookings} />
              <OverviewStat label="All rows" value={bookings.length} />
            </div>

            <div className="admin-dashboard-scrollbar max-h-[860px] overflow-auto pr-xs">
              <div className="flex flex-col gap-[4px]">
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
