"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import type { TUTMTimeRange } from "../types/TUTMTimeRange"

const supabase = supabaseAdmin as any

export type UTMAggregatedStats = {
  totalVisits: number
  uniqueUsers: number
  sourceStats: { name: string; count: number }[]
  mediumStats: { name: string; count: number }[]
  campaignStats: { name: string; count: number }[]
  chartData: { date: string; visits: number }[]
  timeRange: TUTMTimeRange
}

function getWindowStart(timeRange: TUTMTimeRange): Date {
  const now = new Date()
  if (timeRange === "1w") { now.setDate(now.getDate() - 7); return now }
  if (timeRange === "1m") { now.setMonth(now.getMonth() - 1); return now }
  now.setFullYear(now.getFullYear() - 2)
  return now
}

export async function selectDBUTMStatsAction(timeRange: TUTMTimeRange = "1m"): Promise<UTMAggregatedStats | string> {
  try {
    const windowStart = getWindowStart(timeRange)

    const { data: stats, error } = await supabase
      .from("utm_stats")
      .select("*")
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: false })

    if (error) return `Error fetching UTM stats: ${error.message}`

    const entries = (stats ?? []) as Array<{
      id: string
      user_id: string
      created_at: string
      source: string | null
      medium: string | null
      campaign: string | null
      url: string | null
      user_agent: string | null
    }>

    if (!entries.length) {
      return { totalVisits: 0, uniqueUsers: 0, sourceStats: [], mediumStats: [], campaignStats: [], chartData: [], timeRange }
    }

    const totalVisits = entries.length
    const uniqueUsers = new Set(entries.map(entry => entry.user_id)).size

    const toCountMap = (key: keyof typeof entries[0], fallback: string) =>
      entries.reduce<Record<string, number>>((acc, entry) => {
        const val = (entry[key] as string | null) || fallback
        acc[val] = (acc[val] || 0) + 1
        return acc
      }, {})

    const toArray = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

    // 1y → weekly buckets (up to 52 points); 1m/1w → daily
    const getWeekBucket = (d: Date): string => {
      const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7))
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
      const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
      return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
    }

    const chartDataMap = new Map<string, number>()
    for (const entry of entries) {
      const d = new Date(entry.created_at)
      const bucket = timeRange === "1y"
        ? getWeekBucket(d)
        : d.toISOString().split("T")[0]
      chartDataMap.set(bucket, (chartDataMap.get(bucket) || 0) + 1)
    }
    const chartData = Array.from(chartDataMap, ([date, visits]) => ({ date, visits })).sort((a, b) =>
      a.date.localeCompare(b.date),
    )

    return {
      totalVisits,
      uniqueUsers,
      sourceStats: toArray(toCountMap("source", "direct")),
      mediumStats: toArray(toCountMap("medium", "none")),
      campaignStats: toArray(toCountMap("campaign", "no-campaign")),
      chartData,
      timeRange,
    }
  } catch (error) {
    return `Error processing UTM stats: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}
