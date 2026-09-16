import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import supabaseAdmin from "@/libs/supabaseAdmin"
import supabaseServer from "@/libs/supabaseServer"
import { trackedProjects } from "@/data/repos"
import { AdminAnalyticsAccessError, withAdminAnalyticsAccess } from "@/libs/adminAnalyticsAccess"
import { createAnalyticsPeriod, createProjectClicksAggregator, readAnalyticsPages, type ProjectClickAnalyticsRow } from "@/libs/adminAnalytics"

function isTimelineMode(value: string): value is API.ProjectClicksTimelineMode {
  return value === "monthly" || value === "yearly"
}

function isScope(value: string): value is "overview" | "timeline" | "all" {
  return value === "overview" || value === "timeline" || value === "all"
}

export async function GET(request: Request) {
  try {
    const authClient = await supabaseServer()
    const withAdminAnalyticsAccessResp = await withAdminAnalyticsAccess(
      () => authClient.auth.getUser(),
      process.env.ADMIN_USER_ID_ARR,
      async () => {
        const requestUrl = new URL(request.url)
        const projectSlug = requestUrl.searchParams.get("projectSlug") ?? ""
        const timelineModeParam = requestUrl.searchParams.get("timelineMode") ?? "monthly"
        const timelineMode = isTimelineMode(timelineModeParam) ? timelineModeParam : "monthly"
        const scopeParam = requestUrl.searchParams.get("scope") ?? "all"
        const scope = isScope(scopeParam) ? scopeParam : "all"
        const period = createAnalyticsPeriod(timelineMode)
        const aggregator = createProjectClicksAggregator(period, trackedProjects, projectSlug)
        // Analytics tables are not included in the repository's generated Database type.
        const supabase = supabaseAdmin as SupabaseClient

        await readAnalyticsPages<ProjectClickAnalyticsRow>(async afterId => {
          let query = supabase
            .from("project_link_clicks")
            .select("id,created_at,project_slug,link_type")
            .gte("created_at", period.start)
            .lt("created_at", period.end)
            .order("id", { ascending: true })
            .limit(1000)
          if (afterId !== null) query = query.gt("id", afterId)
          if (scope === "timeline") query = query.eq("project_slug", projectSlug)
          const { data, error } = await query
          if (error) throw new Error(error.message)
          return (data ?? []) as ProjectClickAnalyticsRow[]
        }, aggregator.addPage)

        const data = aggregator.result()
        return {
          ...data,
          overview: scope === "timeline" ? [] : data.overview,
          timeline: scope === "overview" ? [] : data.timeline,
        } satisfies API.AdminProjectClicksResponse
      },
    )
    return NextResponse.json(withAdminAnalyticsAccessResp, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Failed to load project-click analytics", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load project clicks" },
      { status: error instanceof AdminAnalyticsAccessError ? 401 : 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
