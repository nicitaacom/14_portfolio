import { nanoid } from "nanoid"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { redisKey } from "@/classes/RedisKey/RedisKey"
import { redis } from "@/libs/redis"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { consumeRateLimit, getRequestIp } from "@/libs/rateLimitServer"

const PROJECT_GROUPS = new Set<API.TrackedProjectGroup>(["work", "projects"])
const LINK_TYPES = new Set<API.ProjectLinkClickType>(["demo", "github", "figma", "youtube"])
const LOCAL_DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/
const DAILY_PROJECT_CLICK_DEDUP_TTL_SEC = 60 * 60 * 24 * 8

function createOkResponse(existingCookieId: string | undefined, userCookieId: string) {
  const response = NextResponse.json<API.TrackProjectLinkClickResponse>({ ok: true })

  if (existingCookieId !== userCookieId) {
    response.cookies.set("user_cookie_id", userCookieId, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as API.TrackProjectLinkClickRequest | null

  if (!body) {
    return NextResponse.json({ error: "Missing body" }, { status: 400 })
  }

  const projectSlug = body.projectSlug?.trim()
  const projectName = body.projectName?.trim()
  const projectGroup = body.projectGroup
  const linkType = body.linkType
  const destinationUrl = body.destinationUrl?.trim()
  const pagePath = body.pagePath?.trim() || "/"
  const userLocalDate = body.userLocalDate?.trim()
  const existingCookieId = cookies().get("user_cookie_id")?.value
  const userCookieId = body.userCookieId?.trim() || existingCookieId || nanoid()
  const ip = getRequestIp(new Headers(request.headers))

  if (!projectSlug || !projectName || !destinationUrl || !userLocalDate) {
    return NextResponse.json({ error: "Missing required tracking fields" }, { status: 400 })
  }

  if (!PROJECT_GROUPS.has(projectGroup)) {
    return NextResponse.json({ error: "Invalid project group" }, { status: 400 })
  }

  if (!LINK_TYPES.has(linkType)) {
    return NextResponse.json({ error: "Invalid link type" }, { status: 400 })
  }

  if (!LOCAL_DATE_REGEXP.test(userLocalDate)) {
    return NextResponse.json({ error: "Invalid user local date" }, { status: 400 })
  }

  const rateLimitResult = await consumeRateLimit({
    limiterName: "projectLinkClick",
    ip,
    userCookieId,
  })

  if (!rateLimitResult.success) {
    return NextResponse.json<API.TrackProjectLinkClickResponse>({ ok: true })
  }

  const dailyProjectClickDedupKey = redisKey.getProjectLinkDailyDedupKey(userCookieId, projectSlug, userLocalDate)
  const isFirstTrackedClickToday = await redis.set(dailyProjectClickDedupKey, "1", {
    ex: DAILY_PROJECT_CLICK_DEDUP_TTL_SEC,
    nx: true,
  })

  if (!isFirstTrackedClickToday) {
    return createOkResponse(existingCookieId, userCookieId)
  }

  const supabaseAdminClient = supabaseAdmin as any

  const { error } = await supabaseAdminClient.from("project_link_clicks").insert({
    project_slug: projectSlug,
    project_name: projectName,
    project_group: projectGroup,
    link_type: linkType,
    destination_url: destinationUrl,
    page_path: pagePath,
    user_cookie_id: userCookieId,
  })

  if (error?.code === "23505") {
    return createOkResponse(existingCookieId, userCookieId)
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return createOkResponse(existingCookieId, userCookieId)
}
