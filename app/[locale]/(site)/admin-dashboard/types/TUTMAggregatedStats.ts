import type { TUTMTimeRange } from "./TUTMTimeRange"

export type TUTMAggregatedStats = {
  totalVisits: number
  uniqueUsers: number
  sourceStats: { name: string; count: number }[]
  mediumStats: { name: string; count: number }[]
  campaignStats: { name: string; count: number }[]
  chartData: { date: string; visits: number }[]
  timeRange: TUTMTimeRange
}
