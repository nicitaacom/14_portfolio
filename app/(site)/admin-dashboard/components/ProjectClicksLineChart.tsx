"use client"

import { useId, useMemo } from "react"
import { motion } from "framer-motion"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"

interface ProjectClicksLineChartProps {
  projectName: string
  timeline: TProjectClicksTimelineDB[]
  timelineMode: TProjectClicksTimelineMode
}

const numberFormatter = new Intl.NumberFormat("en-US")
const CHART_WIDTH = 920
const CHART_HEIGHT = 320
const PADDING_LEFT = 20
const PADDING_RIGHT = 52
const PADDING_TOP = 24
const PADDING_BOTTOM = 40
const GRID_LINE_INDEXES = [0, 1, 2, 3]

function formatMetricValueFn(value: number) {
  if (value >= 10 || Number.isInteger(value)) return numberFormatter.format(Math.round(value))
  return value.toFixed(1)
}

export function ProjectClicksLineChart({ projectName, timeline, timelineMode }: ProjectClicksLineChartProps) {
  const chartGradientId = useId().replace(/:/g, "")
  const maxClicks = useMemo(() => Math.max(...timeline.map(point => point.total_clicks), 1), [timeline])
  const totalClicks = useMemo(() => timeline.reduce((sum, point) => sum + point.total_clicks, 0), [timeline])
  const averageClicks = useMemo(
    () => (timeline.length ? totalClicks / timeline.length : 0),
    [timeline.length, totalClicks],
  )
  const peakPoint = useMemo(
    () =>
      timeline.reduce<TProjectClicksTimelineDB | null>(
        (topPoint, point) => (!topPoint || point.total_clicks > topPoint.total_clicks ? point : topPoint),
        null,
      ),
    [timeline],
  )
  const latestPoint = timeline[timeline.length - 1]

  const points = useMemo(() => {
    if (!timeline.length) return []

    const usableWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT
    const usableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

    return timeline.map((point, index) => {
      const x = PADDING_LEFT + (timeline.length === 1 ? usableWidth / 2 : (index / (timeline.length - 1)) * usableWidth)
      const y = PADDING_TOP + usableHeight - (point.total_clicks / maxClicks) * usableHeight

      return { ...point, x, y }
    })
  }, [maxClicks, timeline])

  const pathDefinition = useMemo(() => {
    if (!points.length) return ""

    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
  }, [points])

  const areaPathDefinition = useMemo(() => {
    if (!points.length) return ""

    const baselineY = CHART_HEIGHT - PADDING_BOTTOM
    return `${pathDefinition} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
  }, [pathDefinition, points])

  const gridLines = useMemo(() => {
    const usableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

    return GRID_LINE_INDEXES.map(index => {
      const y = PADDING_TOP + (usableHeight / (GRID_LINE_INDEXES.length - 1)) * index
      const value = Math.round(maxClicks * (1 - index / (GRID_LINE_INDEXES.length - 1)))

      return { index, value, y }
    })
  }, [maxClicks])

  const visibleLabels = useMemo(() => {
    if (points.length <= 6) return points

    return points.filter(
      (_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 5) === 0,
    )
  }, [points])

  if (!timeline.length) {
    return (
      <p className="py-10 text-center text-sm text-secondary-foreground">
        No click data yet for this project in the selected window.
      </p>
    )
  }

  return (
    <div className="min-w-0 flex flex-col gap-sm">
      <div className="grid gap-xs rounded-[2px] border border-[#343434] bg-[#2a2a2a] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)] tablet:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-secondary-foreground">
            {timelineMode === "monthly" ? "Last 30 days" : "Last 12 months"}
          </p>
          <div className="mt-[8px] flex flex-wrap items-end gap-sm">
            <p className="truncate text-lg text-secondary">{projectName}</p>
            <p className="text-[30px] leading-none text-secondary">{numberFormatter.format(totalClicks)}</p>
            <p className="pb-[3px] text-xs uppercase tracking-[0.18em] text-secondary-foreground">total clicks</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-xs">
          <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-[10px]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">Average</p>
            <p className="mt-[4px] text-sm text-secondary">{formatMetricValueFn(averageClicks)}</p>
          </div>
          <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-[10px]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">Peak</p>
            <p className="mt-[4px] text-sm text-secondary">{numberFormatter.format(peakPoint?.total_clicks ?? 0)}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-secondary-foreground">
              {peakPoint?.bucket_label ?? "-"}
            </p>
          </div>
          <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-[10px]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">Latest</p>
            <p className="mt-[4px] text-sm text-secondary">{numberFormatter.format(latestPoint?.total_clicks ?? 0)}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-secondary-foreground">
              {latestPoint?.bucket_label ?? "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-[4px]">
        <div className="min-w-[920px] rounded-[2px] border border-[#343434] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} fill="none">
            <defs>
              <linearGradient id={`${chartGradientId}-area`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#5a5a5a" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#5a5a5a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {gridLines.map(line => (
              <g key={`${line.index}-${line.value}`}>
                <line
                  x1={PADDING_LEFT}
                  x2={CHART_WIDTH - PADDING_RIGHT}
                  y1={line.y}
                  y2={line.y}
                  stroke="#343434"
                  strokeDasharray="5 8"
                />
                <text fill="#8a8a8a" fontSize="10" textAnchor="end" x={CHART_WIDTH - 6} y={line.y + 4}>
                  {numberFormatter.format(line.value)}
                </text>
              </g>
            ))}

            <motion.path
              animate={{ opacity: 1 }}
              d={areaPathDefinition}
              fill={`url(#${chartGradientId}-area)`}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />

            <motion.path
              animate={{ pathLength: 1, opacity: 1 }}
              d={pathDefinition}
              initial={{ pathLength: 0, opacity: 0.5 }}
              stroke="#5a5a5a"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {points.map((point, index) => (
              <motion.circle
                animate={{ opacity: 1, scale: 1 }}
                cx={point.x}
                cy={point.y}
                fill="#242424"
                initial={{ opacity: 0, scale: 0.7 }}
                key={point.bucket_key}
                r={point.bucket_key === latestPoint?.bucket_key ? "6" : "3.5"}
                stroke={point.bucket_key === latestPoint?.bucket_key ? "#7a7a7a" : "#5a5a5a"}
                strokeWidth={point.bucket_key === latestPoint?.bucket_key ? "4" : "2"}
                transition={{ delay: index * 0.015, duration: 0.22 }}
              />
            ))}

            {visibleLabels.map(point => (
              <text
                fill="#8a8a8a"
                fontSize="10"
                key={point.bucket_key}
                textAnchor="middle"
                x={point.x}
                y={CHART_HEIGHT - 10}>
                {point.bucket_label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
