"use server"

import type { SupabaseClient } from "@supabase/supabase-js"
import supabaseAdmin from "@/libs/supabaseAdmin"
import supabaseServer from "@/libs/supabaseServer"
import { withAdminAnalyticsAccess } from "@/libs/adminAnalyticsAccess"
import { createAnalyticsPeriod, createUTMAnalyticsAggregator, readAnalyticsPages, type UTMAnalyticsRow } from "@/libs/adminAnalytics"
import type { TUTMTimeRange } from "../types/TUTMTimeRange"
import type { TUTMAggregatedStats } from "../types/TUTMAggregatedStats"

// Analytics tables are not included in the repository's generated Database type.
const supabase = supabaseAdmin as SupabaseClient

export async function selectDBUTMStatsAction(timeRange: TUTMTimeRange = "1m"): Promise<TUTMAggregatedStats | string> {
  try {
    const authClient = await supabaseServer()
    return await withAdminAnalyticsAccess(
      () => authClient.auth.getUser(),
      process.env.ADMIN_USER_ID_ARR,
      async () => {
        if (timeRange !== "1w" && timeRange !== "1m" && timeRange !== "1y") throw new Error("Invalid analytics period")
        const period = createAnalyticsPeriod(timeRange)
        const aggregator = createUTMAnalyticsAggregator(period, timeRange)

        await readAnalyticsPages<UTMAnalyticsRow>(async afterId => {
          let query = supabase
            .from("utm_stats")
            .select("id,created_at,user_id,source,medium,campaign")
            .gte("created_at", period.start)
            .lt("created_at", period.end)
            .order("id", { ascending: true })
            .limit(1000)
          if (afterId !== null) query = query.gt("id", afterId)
          const { data, error } = await query
          if (error) throw new Error(error.message)
          return (data ?? []) as UTMAnalyticsRow[]
        }, aggregator.addPage)

        return aggregator.result()
      },
    )
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to load traffic data"
  }
}
