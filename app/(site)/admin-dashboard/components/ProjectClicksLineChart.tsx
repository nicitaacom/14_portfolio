"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"

interface ProjectClicksLineChartProps {
  projectName: string
  timeline: TProjectClicksTimelineDB[]
  timelineMode: TProjectClicksTimelineMode
}

const CHART_WIDTH = 760
const CHART_HEIGHT = 260
const PADDING_X = 20
const PADDING_TOP = 18
const PADDING_BOTTOM = 40
const GRID_LINE_INDEXES = [0, 1, 2, 3]

export function ProjectClicksLineChart({ projectName, timeline, timelineMode }: ProjectClicksLineChartProps) {
  const maxClicks = useMemo(() => Math.max(...timeline.map(point => point.total_clicks), 1), [timeline])

  const points = useMemo(() => {
    if (!timeline.length) return []

    const usableWidth = CHART_WIDTH - PADDING_X * 2
    const usableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

    return timeline.map((point, index) => {
      const x = PADDING_X + (timeline.length === 1 ? usableWidth / 2 : (index / (timeline.length - 1)) * usableWidth)
      const y = PADDING_TOP + usableHeight - (point.total_clicks / maxClicks) * usableHeight

      return { ...point, x, y }
    })
  }, [maxClicks, timeline])

  const pathDefinition = useMemo(() => {
    if (!points.length) return ""

    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
  }, [points])

  const visibleLabels = useMemo(() => {
    if (timeline.length <= 6) return timeline

    return timeline.filter((_, index) => index === 0 || index === timeline.length - 1 || index % Math.ceil(timeline.length / 5) === 0)
  }, [timeline])

  if (!timeline.length) {
    return <p className="py-10 text-center text-sm text-secondary-foreground">No click data yet for this project in the selected window.</p>
  }

  return (
    <div className="min-w-0 flex flex-col gap-sm">
      <div className="flex items-start justify-between gap-sm">
        <div>
          <p className="text-sm text-secondary">{projectName}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-secondary-foreground">
            {timelineMode === "monthly" ? "Last 30 days" : "Last 12 months"}
          </p>
        </div>
        <div className="rounded-[8px] border border-[#363636] bg-[#1f1f1f] px-sm py-xs text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-secondary-foreground">Peak</p>
          <p className="text-sm text-secondary">{maxClicks} clicks</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-[4px]">
        <svg className="min-w-[760px]" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} fill="none">
          {GRID_LINE_INDEXES.map(index => {
            const y = PADDING_TOP + ((CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM) / 3) * index

            return <line key={index} x1={PADDING_X} x2={CHART_WIDTH - PADDING_X} y1={y} y2={y} stroke="#343434" strokeDasharray="4 6" />
          })}

          <motion.path
            animate={{ pathLength: 1, opacity: 1 }}
            d={pathDefinition}
            initial={{ pathLength: 0, opacity: 0.5 }}
            stroke="#c05cff"
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
              fill="#191919"
              initial={{ opacity: 0, scale: 0.7 }}
              key={point.bucket_key}
              r="4.5"
              stroke="#82a0ff"
              strokeWidth="3"
              transition={{ delay: index * 0.015, duration: 0.22 }}
            />
          ))}

          {visibleLabels.map(label => {
            const point = points.find(item => item.bucket_key === label.bucket_key)
            if (!point) return null

            return (
              <text
                fill="#adadad"
                fontSize="10"
                key={label.bucket_key}
                textAnchor="middle"
                x={point.x}
                y={CHART_HEIGHT - 12}>
                {label.bucket_label}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
