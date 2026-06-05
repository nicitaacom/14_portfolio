import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_PASSWORD_COOKIE } from "@/libs/adminAuth"
import { consumeRateLimit, getRateLimitHeaders, getRequestIp, getRetryAfterSeconds } from "@/libs/rateLimitServer"

export async function POST(request: Request) {
  const ip = getRequestIp(new Headers(request.headers))
  const rateLimitResult = await consumeRateLimit({
    limiterName: "adminPasswordAttempt",
    ip,
  })

  if (!rateLimitResult.success) {
    const retryAfter = getRetryAfterSeconds(rateLimitResult.reset)
    return NextResponse.json<API.AdminPasswordResponse>(
      { ok: false, error: `Too many admin password attempts. Please try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      },
    )
  }

  const { password } = (await request.json()) as API.AdminPasswordRequest

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    (await cookies()).delete(ADMIN_PASSWORD_COOKIE)
    return NextResponse.json<API.AdminPasswordResponse>({ ok: false, error: "Invalid password" }, { status: 401 })
  }

  (await cookies()).set(ADMIN_PASSWORD_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  })

  return NextResponse.json<API.AdminPasswordResponse>({ ok: true })
}
