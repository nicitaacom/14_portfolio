"use client"

import { useEffect, useMemo, useState } from "react"
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
import { selectDBUTMStatsAction, UTMAggregatedStats } from "../actions/selectDBUTMStatsAction"
import { useScopedI18n } from "@/locales/client"

const numberFormatter = new Intl.NumberFormat("en-US")

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">{label}</p>
      <p className="mt-[6px] text-lg text-secondary">{value}</p>
    </div>
  )
}

function StatPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-[2px] border border-[#3a3a3a] bg-[#262626] px-[10px] py-[6px] text-xs text-secondary">
      <span className="font-medium text-[#f5f7fb]">{label}</span>
      <span className="text-[#a8b1c7]">{count}</span>
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
    <div className="rounded-[4px] border border-[#3a3a3a] bg-[#1a1a1a] px-[10px] py-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <p className="mb-[2px] text-[10px] uppercase tracking-[0.14em] text-[#6a6a6a]">{label}</p>
      <p className="text-sm font-medium text-[#e8e8e8]">
        {numberFormatter.format(payload[0].value)}{" "}
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#5a5a5a]">visits</span>
      </p>
    </div>
  )
}

function VisitsAreaChart({ data }: { data: { date: string; visits: number }[] }) {
  const maxVisits = Math.max(...data.map(d => d.visits), 1)
  const yMax = Math.ceil(maxVisits * 1.2)

  const tickLabels = useMemo(() => {
    if (data.length <= 6) return new Set(data.map(d => d.date))
    const step = Math.floor((data.length - 1) / 5)
    return new Set([0, 1, 2, 3, 4, 5].map(i => data[Math.min(i * step, data.length - 1)]?.date))
  }, [data])

  if (!data.length) return null

  return (
    <div className="rounded-[2px] border border-[#2e2e2e] bg-[#161616] p-sm">
      <p className="mb-[10px] text-[10px] uppercase tracking-[0.18em] text-[#5a5a5a]">Visits over time</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -8 }}>
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
            tick={{ fill: "#555", fontSize: 10, fontFamily: "inherit" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={label => (tickLabels.has(label) ? label.slice(5) : "")}
          />

          <YAxis
            domain={[0, yMax]}
            tick={{ fill: "#555", fontSize: 10, fontFamily: "inherit" }}
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
  const [utmStats, setUtmStats] = useState<UTMAggregatedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useScopedI18n("admin")

  const loadStats = async () => {
    setLoading(true)
    setError(null)

    const result = await selectDBUTMStatsAction()
    if (typeof result === "string") {
      setError(result)
      setUtmStats(null)
    } else {
      setUtmStats(result)
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const topSources = useMemo(() => utmStats?.sourceStats.slice(0, 4) ?? [], [utmStats])
  const topCampaigns = useMemo(() => utmStats?.campaignStats.slice(0, 4) ?? [], [utmStats])
  const chartData = useMemo(() => utmStats?.chartData ?? [], [utmStats])

  return (
    <section className="rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-sm flex items-start justify-between gap-sm">
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{t("utmOverviewTitle")}</h2>
          <p className="text-xs text-secondary-foreground">{t("utmOverviewSubtitle")}</p>
        </div>
        <button
          className="inline-flex shrink-0 items-center justify-center gap-[8px] rounded-[2px] border border-[#343434] bg-[#2a2a2a] px-sm py-xs text-secondary transition hover:bg-[#2f2f2f]"
          onClick={() => void loadStats()}>
          <FiRefreshCcw size={14} />
          {t("refresh")}
        </button>
      </div>

      {error ? (
        <div className="mb-sm rounded-[2px] border border-danger/20 bg-[#2d1218] px-sm py-sm text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-[10px] laptop:flex-row">
          {[1, 2, 3].map(index => (
            <div key={index} className="h-[95px] w-full animate-pulse rounded-[2px] bg-[#202020]" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[10px] laptop:flex-row">
          <SummaryCard label={t("totalVisits")} value={utmStats?.totalVisits ?? 0} />
          <SummaryCard label={t("uniqueUsers")} value={utmStats?.uniqueUsers ?? 0} />
          <SummaryCard label={t("recentVisits")} value={utmStats?.recentVisits ?? 0} />
        </div>
      )}

      {!loading && chartData.length > 1 && (
        <div className="mt-sm">
          <VisitsAreaChart data={chartData} />
        </div>
      )}

      <div className="mt-sm grid gap-[10px] lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2px] border border-[#343434] bg-[#202020] p-sm">
          <h3 className="mb-sm text-sm uppercase tracking-[0.18em] text-secondary-foreground">{t("topSources")}</h3>
          {loading ? (
            <div className="space-y-[8px]">
              {[1, 2, 3, 4].map(index => (
                <div key={index} className="h-[34px] animate-pulse rounded-[2px] bg-[#1f1f1f]" />
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

        <div className="rounded-[2px] border border-[#343434] bg-[#202020] p-sm">
          <h3 className="mb-sm text-sm uppercase tracking-[0.18em] text-secondary-foreground">{t("topCampaigns")}</h3>
          {loading ? (
            <div className="space-y-[8px]">
              {[1, 2, 3].map(index => (
                <div key={index} className="h-[34px] animate-pulse rounded-[2px] bg-[#1f1f1f]" />
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
