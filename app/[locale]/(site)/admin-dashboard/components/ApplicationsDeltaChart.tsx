"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { TJobSearchMonth } from "../types/TJobSearchMonth"
import { getApplicationsStatusTone } from "../utils/getApplicationsStatusTone"

/** STATIC color map — no interpolation so Tailwind doesn't purge and Recharts gets actual hex values. */
const toneColorMap = {
  danger: "hsl(0 84% 48%)",
  warning: "hsl(47 100% 50%)",
  success: "hsl(118 79% 44%)",
} as const

function ChartTooltip({
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
        {payload[0].value}{" "}
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#5a5a5a]">applies</span>
      </p>
    </div>
  )
}

interface Props {
  months: TJobSearchMonth[]
}

export function ApplicationsDeltaChart({ months }: Props) {
  const chartData = useMemo(
    () =>
      [...months]
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(1) // skip first entry — no previous month means delta is the full cumulative total, not a real monthly diff
        .map(month => {
          const [year, monthNumber] = month.month.split("-")
          return {
            label: `${monthNumber}.${year}`,
            delta: month.applications,
            tone: getApplicationsStatusTone(month.applications),
          }
        }),
    [months],
  )

  const yMax = Math.ceil(Math.max(...chartData.map(d => d.delta), 1) * 1.2)

  if (!chartData.length) return null

  return (
    <div className="mt-sm rounded-[2px] border border-[#2e2e2e] bg-[#161616] p-sm">
      <p className="mb-[10px] text-[10px] uppercase tracking-[0.18em] text-[#5a5a5a]">Applications delta</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 12, right: 8, bottom: 0, left: -8 }} barSize={32}>
          <CartesianGrid strokeDasharray="2 6" stroke="#252525" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fill: "#555", fontSize: 10, fontFamily: "inherit" }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={[0, yMax]}
            tick={{ fill: "#555", fontSize: 10, fontFamily: "inherit" }}
            tickLine={false}
            axisLine={false}
            width={36}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />

          <Bar dataKey="delta" radius={[2, 2, 0, 0]} animationDuration={600} animationEasing="ease-out">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={toneColorMap[entry.tone]} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
