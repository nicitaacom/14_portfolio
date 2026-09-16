import type { TAnalyticsPeriod } from "@/[locale]/(site)/admin-dashboard/types/TAnalyticsPeriod"
import type { TUTMAggregatedStats } from "@/[locale]/(site)/admin-dashboard/types/TUTMAggregatedStats"
import type { TUTMTimeRange } from "@/[locale]/(site)/admin-dashboard/types/TUTMTimeRange"

type AnalyticsRange = TUTMTimeRange | API.ProjectClicksTimelineMode
type AnalyticsRowId = string | number

export interface UTMAnalyticsRow {
  id: string
  created_at: string
  user_id: string
  source: string | null
  medium: string | null
  campaign: string | null
}

export interface ProjectClickAnalyticsRow {
  id: AnalyticsRowId
  created_at: string
  project_slug: string
  link_type: API.ProjectLinkClickType
}

interface AnalyticsProject {
  slug: string
  name: string
  group: API.TrackedProjectGroup
}

export function createAnalyticsPeriod(range: AnalyticsRange, asOf = new Date()): TAnalyticsPeriod {
  if (!Number.isFinite(asOf.getTime())) throw new Error("Invalid analytics date")
  const yearly = range === "1y" || range === "yearly"
  const start = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), yearly ? 1 : asOf.getUTCDate()))
  if (yearly) start.setUTCMonth(start.getUTCMonth() - 11)
  else start.setUTCDate(start.getUTCDate() - (range === "1w" ? 6 : 29))

  return { start: start.toISOString(), end: asOf.toISOString(), bucketUnit: yearly ? "month" : "day", timezone: "UTC" }
}

export function getAnalyticsBucketKeys(period: TAnalyticsPeriod): string[] {
  const cursor = new Date(period.start)
  const end = new Date(period.end)
  const lastBucket = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), period.bucketUnit === "month" ? 1 : end.getUTCDate())
  const keys: string[] = []
  while (cursor.getTime() <= lastBucket) {
    keys.push(cursor.toISOString().slice(0, period.bucketUnit === "month" ? 7 : 10))
    if (period.bucketUnit === "month") cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    else cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return keys
}

/** A short page can be a server response cap; only an empty page proves completion. */
export async function readAnalyticsPages<T extends { id: AnalyticsRowId }>(
  fetchPage: (afterId: AnalyticsRowId | null) => Promise<T[]>,
  consumePage: (rows: T[]) => void,
): Promise<void> {
  let afterId: AnalyticsRowId | null = null
  while (true) {
    const fetchPageResp = await fetchPage(afterId)
    if (fetchPageResp.length === 0) return
    const nextId = fetchPageResp[fetchPageResp.length - 1].id
    if (afterId !== null && String(nextId) === String(afterId)) {
      throw new Error("Analytics pagination did not advance")
    }
    consumePage(fetchPageResp)
    afterId = nextId
  }
}

function countValue(counts: Map<string, number>, value: string | null, fallback: string) {
  const name = value || fallback
  counts.set(name, (counts.get(name) ?? 0) + 1)
}

function rankedCounts(counts: Map<string, number>) {
  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
}

function periodBucket(timestamp: string, period: TAnalyticsPeriod): string | null {
  const date = new Date(timestamp)
  const time = date.getTime()
  if (time < Date.parse(period.start) || time >= Date.parse(period.end) || !Number.isFinite(time)) return null
  return date.toISOString().slice(0, period.bucketUnit === "month" ? 7 : 10)
}

export function createUTMAnalyticsAggregator(period: TAnalyticsPeriod, timeRange: TUTMTimeRange) {
  const buckets = new Map(getAnalyticsBucketKeys(period).map(key => [key, 0]))
  const visitors = new Set<string>()
  const sources = new Map<string, number>()
  const mediums = new Map<string, number>()
  const campaigns = new Map<string, number>()
  let totalVisits = 0

  return {
    addPage(rows: UTMAnalyticsRow[]) {
      for (const row of rows) {
        const bucket = periodBucket(row.created_at, period)
        if (!bucket || !buckets.has(bucket)) continue
        totalVisits += 1
        visitors.add(row.user_id)
        buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
        countValue(sources, row.source, "direct")
        countValue(mediums, row.medium, "none")
        countValue(campaigns, row.campaign, "no-campaign")
      }
    },
    result(): TUTMAggregatedStats {
      return {
        totalVisits,
        uniqueUsers: visitors.size,
        sourceStats: rankedCounts(sources),
        mediumStats: rankedCounts(mediums),
        campaignStats: rankedCounts(campaigns),
        chartData: Array.from(buckets, ([date, visits]) => ({ date, visits })),
        timeRange,
        period,
      }
    },
  }
}

export function createProjectClicksAggregator(
  period: TAnalyticsPeriod,
  projects: readonly AnalyticsProject[],
  selectedProjectSlug: string,
) {
  const overview = new Map<string, API.ProjectClicksOverviewRow>(projects.map(project => [project.slug, {
    project_slug: project.slug,
    project_name: project.name,
    project_group: project.group,
    total_clicks: 0,
    demo_clicks: 0,
    github_clicks: 0,
    figma_clicks: 0,
    youtube_clicks: 0,
  }]))
  const buckets = new Map(getAnalyticsBucketKeys(period).map(key => [key, 0]))

  return {
    addPage(rows: ProjectClickAnalyticsRow[]) {
      for (const row of rows) {
        const bucket = periodBucket(row.created_at, period)
        const project = overview.get(row.project_slug)
        if (!bucket || !buckets.has(bucket) || !project) continue
        project.total_clicks += 1
        project[`${row.link_type}_clicks`] += 1
        if (row.project_slug === selectedProjectSlug) buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
      }
    },
    result(): API.AdminProjectClicksResponse {
      return {
        overview: Array.from(overview.values()).sort(
          (a, b) => b.total_clicks - a.total_clicks || a.project_slug.localeCompare(b.project_slug),
        ),
        timeline: selectedProjectSlug ? Array.from(buckets, ([bucket_key, total_clicks]) => ({
          bucket_key,
          bucket_label: bucket_key,
          total_clicks,
        })) : [],
        period,
      }
    },
  }
}
