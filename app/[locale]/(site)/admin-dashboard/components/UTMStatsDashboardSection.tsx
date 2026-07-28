"use client"

import { useMemo } from "react"
import { FiRefreshCcw } from "react-icons/fi"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useUTMStats } from "../hooks/useUTMStats"
import { UTMTimeRangeSwitcher } from "./UTMTimeRangeSwitcher"
import { useScopedI18n } from "@/locales/client"

const numberFormatter = new Intl.NumberFormat("en-US")

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2px] border border-brass/40 bg-steel px-sm py-xs">
      <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">{label}</p>
      <p className="mt-[6px] text-lg text-secondary">{value}</p>
    </div>
  )
}

function StatPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-[2px] border border-brass/40 bg-steel px-[10px] py-[6px] text-xs text-secondary">
      <span className="font-medium text-secondary">{label}</span>
      <span className="text-secondary-foreground">{count}</span>
    </div>
  )
}

function VisitsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-[2px] border border-brass/40 bg-steel px-[10px] py-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      <p className="mb-[2px] text-[10px] uppercase tracking-[0.14em] text-secondary-foreground/70">{label}</p>
      <p className="text-sm font-semibold text-secondary">
        {numberFormatter.format(payload[0].value)}{" "}
        <span className="text-[10px] uppercase tracking-[0.12em] text-secondary-foreground/70">visits</span>
      </p>
    </div>
  )
}

function VisitsAreaChart({ data, isMonthly }: { data: { date: string; visits: number }[]; isMonthly: boolean }) {
  const maxVisits = Math.max(...data.map(d => d.visits), 1)
  const yMax = Math.ceil(maxVisits * 1.2)

  const tickLabels = useMemo(() => {
    if (data.length <= 6) return new Set(data.map(d => d.date))
    const step = Math.floor((data.length - 1) / 5)
    return new Set([0, 1, 2, 3, 4, 5].map(i => data[Math.min(i * step, data.length - 1)]?.date))
  }, [data])

  if (!data.length) return null

  return (
    <div className="rounded-[2px] border border-brass/40 bg-steel-deep p-sm">
      <p className="mb-[10px] text-[10px] uppercase tracking-[0.18em] text-secondary-foreground/70">Visits over time</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 20, left: -8 }}>
          <defs>
            <linearGradient id="utmAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="70%" stopColor="#34d399" stopOpacity={0.04} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="2 6" stroke="#252525" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: "#999", fontSize: 10, fontFamily: "inherit" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={label => {
              if (!tickLabels.has(label)) return ""
              return label.slice(5)
            }}
          />

          <YAxis
            domain={[0, yMax]}
            tick={{ fill: "#999", fontSize: 10, fontFamily: "inherit" }}
            tickLine={false}
            axisLine={false}
            width={28}
            tickFormatter={v => (v === 0 ? "0" : String(v))}
          />

          <Tooltip
            content={<VisitsTooltip />}
            cursor={{ stroke: "#3a3a3a", strokeWidth: 1, strokeDasharray: "4 4" }}
          />

          <Area
            type="monotone"
            dataKey="visits"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#utmAreaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#161616", stroke: "#34d399", strokeWidth: 2 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function UTMStatsDashboardSection() {
  const t = useScopedI18n("admin")
  const { utmStats, isLoading, error, timeRange, setTimeRange, refetch } = useUTMStats()

  const topSources = useMemo(() => utmStats?.sourceStats.slice(0, 4) ?? [], [utmStats])
  const topCampaigns = useMemo(() => utmStats?.campaignStats.slice(0, 4) ?? [], [utmStats])
  const chartData = useMemo(() => utmStats?.chartData ?? [], [utmStats])
  const avgPerBucket = useMemo(() => {
    if (!utmStats || utmStats.totalVisits === 0) return 0
    if (timeRange === "1m") {
      // 1M window has daily buckets — avg per week = total ÷ 4
      return Math.round(utmStats.totalVisits / 4)
    }
    if (timeRange === "1y") {
      // weekly buckets — group into distinct calendar months
      const months = new Set(chartData.map(d => {
        // "2026-W21" → parse year+week to approximate month
        return d.date.slice(0, 4) + "-" + String(Math.ceil(parseInt(d.date.slice(6)) / 4.33)).padStart(2, "0")
      })).size || 1
      return Math.round(utmStats.totalVisits / months)
    }
    // 1w → avg per day
    if (chartData.length === 0) return 0
    return Math.round(utmStats.totalVisits / chartData.length)
  }, [utmStats, chartData, timeRange])

  return (
    <section className="rounded-[2px] border border-brass/40 bg-steel p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-sm flex flex-wrap items-start justify-between gap-sm">
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{t("utmOverviewTitle")}</h2>
          <p className="text-xs text-secondary-foreground">{t("utmOverviewSubtitle")}</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <UTMTimeRangeSwitcher timeRange={timeRange} onChange={setTimeRange} />
          <button
            className="inline-flex shrink-0 items-center justify-center gap-[8px] rounded-[2px] border border-brass/40 bg-steel px-sm py-xs text-secondary transition hover:bg-steel"
            onClick={refetch}>
            <FiRefreshCcw size={14} />
            {t("refresh")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-sm rounded-[2px] border border-danger/20 bg-danger/15 px-sm py-sm text-sm text-danger">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-[10px] laptop:flex-row">
          {[1, 2].map(index => (
            <div key={index} className="h-[95px] w-full animate-pulse rounded-[2px] bg-steel" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[10px] laptop:flex-row">
          <SummaryCard label={t("totalVisits")} value={utmStats?.totalVisits ?? 0} />
          <SummaryCard label={t("uniqueUsers")} value={utmStats?.uniqueUsers ?? 0} />
          <SummaryCard
            label={timeRange === "1w" ? t("avgPerDay") : timeRange === "1m" ? t("avgPerWeek") : t("avgPerMonth")}
            value={avgPerBucket}
          />
        </div>
      )}

      {!isLoading && chartData.length > 1 && (
        <div className="mt-sm">
          <VisitsAreaChart data={chartData} isMonthly={timeRange === "1y"} />
        </div>
      )}

      <div className="mt-sm grid gap-[10px] lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2px] border border-brass/40 bg-steel p-sm">
          <h3 className="mb-sm text-sm uppercase tracking-[0.18em] text-secondary-foreground">{t("topSources")}</h3>
          {isLoading ? (
            <div className="space-y-[8px]">
              {[1, 2, 3, 4].map(index => (
                <div key={index} className="h-[34px] animate-pulse rounded-[2px] bg-steel-deep" />
              ))}
            </div>
          ) : topSources.length ? (
            <div className="grid gap-[8px]">
              {topSources.map(source => (
                <StatPill key={source.name} label={source.name} count={source.count} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{t("noSourceData")}</p>
          )}
        </div>

        <div className="rounded-[2px] border border-brass/40 bg-steel p-sm">
          <h3 className="mb-sm text-sm uppercase tracking-[0.18em] text-secondary-foreground">{t("topCampaigns")}</h3>
          {isLoading ? (
            <div className="space-y-[8px]">
              {[1, 2, 3].map(index => (
                <div key={index} className="h-[34px] animate-pulse rounded-[2px] bg-steel-deep" />
              ))}
            </div>
          ) : topCampaigns.length ? (
            <div className="grid gap-[8px]">
              {topCampaigns.map(campaign => (
                <StatPill key={campaign.name} label={campaign.name} count={campaign.count} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{t("noCampaignData")}</p>
          )}
        </div>
      </div>
    </section>
  )
}
