"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"

const supabase = supabaseAdmin as any

export type UTMAggregatedStats = {
  totalVisits: number
  uniqueUsers: number
  recentVisits: number
  sourceStats: { name: string; count: number }[]
  mediumStats: { name: string; count: number }[]
  campaignStats: { name: string; count: number }[]
  rawStats: Array<{
    id: string
    user_id: string
    visited_at: string
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    utm_term: string | null
    utm_content: string | null
  }>
  chartData: { date: string; visits: number }[]
}

export async function selectDBUTMStatsAction(): Promise<UTMAggregatedStats | string> {
  try {
    const { data: stats, error } = await supabase
      .from("utm_stats")
      .select("*")
      .order("visited_at", { ascending: false })

    if (error) return `Error fetching UTM stats: ${error.message}`

    const entries = (stats ?? []) as Array<{
      id: string
      user_id: string
      visited_at: string
      utm_source: string | null
      utm_medium: string | null
      utm_campaign: string | null
      utm_term: string | null
      utm_content: string | null
    }>
    const totalVisits = entries.length
    if (!totalVisits) {
      return {
        totalVisits: 0,
        uniqueUsers: 0,
        recentVisits: 0,
        sourceStats: [],
        mediumStats: [],
        campaignStats: [],
        rawStats: [],
        chartData: [],
      }
    }

    const uniqueUsers = new Set(entries.map(entry => entry.user_id)).size
    const sourceStatsObj = entries.reduce<Record<string, number>>((acc, entry) => {
      const source = entry.utm_source || "direct"
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})
    const mediumStatsObj = entries.reduce<Record<string, number>>((acc, entry) => {
      const medium = entry.utm_medium || "none"
      acc[medium] = (acc[medium] || 0) + 1
      return acc
    }, {})
    const campaignStatsObj = entries.reduce<Record<string, number>>((acc, entry) => {
      const campaign = entry.utm_campaign || "no-campaign"
      acc[campaign] = (acc[campaign] || 0) + 1
      return acc
    }, {})

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentVisits = entries.filter(entry => new Date(entry.visited_at) >= thirtyDaysAgo).length

    const chartDataMap = new Map<string, number>()
    for (const entry of entries) {
      const date = new Date(entry.visited_at).toISOString().split("T")[0]
      chartDataMap.set(date, (chartDataMap.get(date) || 0) + 1)
    }

    const chartData = Array.from(chartDataMap, ([date, visits]) => ({ date, visits })).sort((a, b) =>
      a.date.localeCompare(b.date),
    )

    const toArray = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, count]) => ({ name, count }))

    return {
      totalVisits,
      uniqueUsers,
      sourceStats: toArray(sourceStatsObj),
      mediumStats: toArray(mediumStatsObj),
      campaignStats: toArray(campaignStatsObj),
      recentVisits,
      rawStats: entries.slice(0, 10) as UTMAggregatedStats["rawStats"],
      chartData,
    }
  } catch (error) {
    return `Error processing UTM stats: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}
