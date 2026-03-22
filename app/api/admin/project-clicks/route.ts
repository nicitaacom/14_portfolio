import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { parseAdminUserIdArr } from "@/libs/adminAuth"
import supabaseAdmin from "@/libs/supabaseAdmin"

function isTimelineMode(value: string): value is API.ProjectClicksTimelineMode {
  return value === "monthly" || value === "yearly"
}

function isScope(value: string): value is "overview" | "timeline" | "all" {
  return value === "overview" || value === "timeline" || value === "all"
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const projectSlug = requestUrl.searchParams.get("projectSlug") ?? ""
  const timelineModeParam = requestUrl.searchParams.get("timelineMode") ?? "monthly"
  const timelineMode = isTimelineMode(timelineModeParam) ? timelineModeParam : "monthly"
  const scopeParam = requestUrl.searchParams.get("scope") ?? "all"
  const scope = isScope(scopeParam) ? scopeParam : "all"

  const supabase = createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 })
  }

  const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)

  if (!user?.id || !adminUserIds.includes(user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseAdminClient = supabaseAdmin as any

  if (scope === "overview") {
    const { data: overview, error: overviewError } = await supabaseAdminClient.rpc("get_project_clicks_overview", { p_window: timelineMode })

    if (overviewError) {
      return NextResponse.json({ error: overviewError.message }, { status: 500 })
    }

    return NextResponse.json<API.AdminProjectClicksResponse>({
      overview: (overview ?? []) as API.ProjectClicksOverviewRow[],
      timeline: [],
    })
  }

  if (scope === "timeline") {
    const { data: timeline, error: timelineError } = projectSlug
      ? await supabaseAdminClient.rpc("get_project_clicks_timeline", {
          p_project_slug: projectSlug,
          p_window: timelineMode,
        })
      : { data: [], error: null }

    if (timelineError) {
      return NextResponse.json({ error: timelineError.message }, { status: 500 })
    }

    return NextResponse.json<API.AdminProjectClicksResponse>({
      overview: [],
      timeline: (timeline ?? []) as API.ProjectClicksTimelineRow[],
    })
  }

  const [{ data: overview, error: overviewError }, { data: timeline, error: timelineError }] = await Promise.all([
    supabaseAdminClient.rpc("get_project_clicks_overview", { p_window: timelineMode }),
    projectSlug
      ? supabaseAdminClient.rpc("get_project_clicks_timeline", {
          p_project_slug: projectSlug,
          p_window: timelineMode,
        })
      : Promise.resolve({ data: [], error: null }),
  ])

  if (overviewError) {
    return NextResponse.json({ error: overviewError.message }, { status: 500 })
  }

  if (timelineError) {
    return NextResponse.json({ error: timelineError.message }, { status: 500 })
  }

  return NextResponse.json<API.AdminProjectClicksResponse>({
    overview: (overview ?? []) as API.ProjectClicksOverviewRow[],
    timeline: (timeline ?? []) as API.ProjectClicksTimelineRow[],
  })
}
