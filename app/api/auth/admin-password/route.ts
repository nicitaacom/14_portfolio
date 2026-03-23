import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_PASSWORD_COOKIE } from "@/libs/adminAuth"
import { consumeRateLimit, getRateLimitHeaders, getRequestIp } from "@/libs/rateLimitServer"

export async function POST(request: Request) {
  const ip = getRequestIp(new Headers(request.headers))
  const rateLimitResult = await consumeRateLimit({
    limiterName: "adminPasswordAttempt",
    ip,
  })

  if (!rateLimitResult.success) {
    return NextResponse.json<API.AdminPasswordResponse>(
      { ok: false, error: "Too many admin password attempts. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      },
    )
  }

  const { password } = (await request.json()) as API.AdminPasswordRequest

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    cookies().delete(ADMIN_PASSWORD_COOKIE)
    return NextResponse.json<API.AdminPasswordResponse>({ ok: false, error: "Invalid password" }, { status: 401 })
  }

  cookies().set(ADMIN_PASSWORD_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  })

  return NextResponse.json<API.AdminPasswordResponse>({ ok: true })
}
