"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"
import { useScopedI18n } from "@/locales/client"

interface ProjectClicksLineChartProps {
  projectName: string
  timeline: TProjectClicksTimelineDB[]
  timelineMode: TProjectClicksTimelineMode
}

const numberFormatter = new Intl.NumberFormat("en-US")

function formatMetricValue(value: number) {
  if (value >= 10 || Number.isInteger(value)) return numberFormatter.format(Math.round(value))
  return value.toFixed(1)
}

function CustomTooltip({
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
    <div className="rounded-[4px] border border-brass/40 bg-steel-deep px-[10px] py-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <p className="mb-[2px] text-[10px] uppercase tracking-[0.14em] text-secondary-foreground/70">{label}</p>
      <p className="text-sm font-medium text-secondary">
        {numberFormatter.format(payload[0].value)}{" "}
        <span className="text-[10px] uppercase tracking-[0.12em] text-secondary-foreground/70">clicks</span>
      </p>
    </div>
  )
}

function CustomDot({
  cx,
  cy,
  payload,
  isLatest,
  isPeak,
}: {
  cx?: number
  cy?: number
  payload?: TProjectClicksTimelineDB
  isLatest?: boolean
  isPeak?: boolean
}) {
  if (cx === undefined || cy === undefined) return null
  if (!isLatest && !isPeak) return null

  const r = isLatest ? 5 : 4
  const strokeColor = isLatest ? "#9b9b9b" : "#6b8cff"
  const strokeWidth = isLatest ? 3 : 2

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="#1c1c1c"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  )
}

export function ProjectClicksLineChart({ projectName, timeline, timelineMode }: ProjectClicksLineChartProps) {
  const t = useScopedI18n("admin")

  const maxClicks = useMemo(() => Math.max(...timeline.map(p => p.total_clicks), 1), [timeline])
  const totalClicks = useMemo(() => timeline.reduce((sum, p) => sum + p.total_clicks, 0), [timeline])
  const averageClicks = useMemo(() => (timeline.length ? totalClicks / timeline.length : 0), [timeline, totalClicks])
  const peakPoint = useMemo(
    () => timeline.reduce<TProjectClicksTimelineDB | null>((top, p) => (!top || p.total_clicks > top.total_clicks ? p : top), null),
    [timeline],
  )
  const latestPoint = timeline[timeline.length - 1]

  const tickCount = Math.min(timeline.length, 6)
  const tickIndexes = useMemo(() => {
    if (timeline.length <= tickCount) return timeline.map((_, i) => i)
    const step = Math.floor((timeline.length - 1) / (tickCount - 1))
    return Array.from({ length: tickCount }, (_, i) => i * step)
  }, [timeline, tickCount])

  const tickLabels = useMemo(
    () => new Set(tickIndexes.map(i => timeline[i]?.bucket_label)),
    [tickIndexes, timeline],
  )

  const yMax = Math.ceil(maxClicks * 1.15)

  if (!timeline.length) {
    return (
      <p className="py-10 text-center text-sm text-secondary-foreground">{t("noProjectClickData")}</p>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      {/* Header stats */}
      <div className="grid gap-xs rounded-[2px] border border-brass/40 bg-steel-deep p-sm tablet:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground/70">
            {timelineMode === "monthly" ? t("last30Days") : t("last12Months")}
          </p>
          <div className="mt-[8px] flex flex-wrap items-end gap-sm">
            <p className="truncate text-base text-secondary">{projectName}</p>
            <p className="text-[28px] leading-none text-secondary">{numberFormatter.format(totalClicks)}</p>
            <p className="pb-[3px] text-[10px] uppercase tracking-[0.18em] text-secondary-foreground/70">{t("totalClicks")}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-xs">
          <div className="rounded-[2px] border border-brass/40 bg-steel-deep px-sm py-[10px]">
            <p className="text-[9px] uppercase tracking-[0.18em] text-secondary-foreground/70">{t("average")}</p>
            <p className="mt-[4px] text-sm text-secondary">{formatMetricValue(averageClicks)}</p>
          </div>
          <div className="rounded-[2px] border border-brass/40 bg-steel-deep px-sm py-[10px]">
            <p className="text-[9px] uppercase tracking-[0.18em] text-secondary-foreground/70">{t("peak")}</p>
            <p className="mt-[4px] text-sm text-secondary">{numberFormatter.format(peakPoint?.total_clicks ?? 0)}</p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-secondary-foreground/70">{peakPoint?.bucket_label ?? "-"}</p>
          </div>
          <div className="rounded-[2px] border border-brass/40 bg-steel-deep px-sm py-[10px]">
            <p className="text-[9px] uppercase tracking-[0.18em] text-secondary-foreground/70">{t("latest")}</p>
            <p className="mt-[4px] text-sm text-secondary">{numberFormatter.format(latestPoint?.total_clicks ?? 0)}</p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-secondary-foreground/70">{latestPoint?.bucket_label ?? "-"}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-[2px] border border-brass/40 bg-steel-deep p-sm">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={timeline} margin={{ top: 16, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b8cff" stopOpacity={0.22} />
                <stop offset="60%" stopColor="#6b8cff" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#6b8cff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 6"
              stroke="#252525"
              vertical={false}
            />

            <XAxis
              dataKey="bucket_label"
              tick={{ fill: "#555", fontSize: 10, fontFamily: "inherit" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickFormatter={label => (tickLabels.has(label) ? label : "")}
            />

            <YAxis
              domain={[0, yMax]}
              tick={{ fill: "#555", fontSize: 10, fontFamily: "inherit" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => (v === 0 ? "0" : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              width={36}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#3a3a3a", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            {peakPoint && (
              <ReferenceLine
                x={peakPoint.bucket_label}
                stroke="#3a3a3a"
                strokeDasharray="3 5"
                label={{ value: "↑ peak", position: "insideTopRight", fill: "#4a4a4a", fontSize: 9 }}
              />
            )}

            <Area
              type="monotone"
              dataKey="total_clicks"
              stroke="#6b8cff"
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={(props) => (
                <CustomDot
                  {...props}
                  isLatest={props.payload?.bucket_key === latestPoint?.bucket_key}
                  isPeak={props.payload?.bucket_key === peakPoint?.bucket_key}
                />
              )}
              activeDot={{ r: 5, fill: "#1c1c1c", stroke: "#6b8cff", strokeWidth: 2 }}
              animationDuration={700}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
