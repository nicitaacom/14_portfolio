import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

import { ADMIN_PASSWORD_COOKIE, parseAdminUserIdArr } from "@/libs/adminAuth"
import { getLocaleFromPathname, localizePath } from "@/locales/helpers"

function getFirstHeaderValue(headerValue: string | null) {
  return headerValue?.split(",")[0]?.trim()
}

function getPublicOrigin(request: Request) {
  const requestUrl = new URL(request.url)
  const forwardedHost = getFirstHeaderValue(request.headers.get("x-forwarded-host"))
  const forwardedProto = getFirstHeaderValue(request.headers.get("x-forwarded-proto"))

  if (forwardedHost) {
    const protocol = forwardedProto || requestUrl.protocol.replace(":", "") || "https"
    return `${protocol}://${forwardedHost}`
  }

  const host = request.headers.get("host")

  if (host) {
    const protocol = requestUrl.protocol.replace(":", "") || "https"
    return `${protocol}://${host}`
  }

  return requestUrl.origin
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const publicOrigin = getPublicOrigin(request)
  const locale = getLocaleFromPathname(requestUrl.pathname)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as unknown as ReturnType<typeof cookies> },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth exchange error:", error.message)
      return NextResponse.json({ error: "Failed to authenticate", details: error.message }, { status: 401 })
    }

    if (!data.session || !data.user || !data.user.email) {
      return NextResponse.json({ error: "Invalid session or user data" }, { status: 401 })
    }

    const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)

    if (adminUserIds.length > 0 && !adminUserIds.includes(data.user.id)) {
      await supabase.auth.signOut()
      cookieStore.delete(ADMIN_PASSWORD_COOKIE)
      const redirectUrl = new URL(localizePath("/auth", locale), publicOrigin)
      redirectUrl.searchParams.set("error", "unauthorized")
      redirectUrl.searchParams.set("reason", "admin_user_id_mismatch")
      redirectUrl.searchParams.set("userId", data.user.id)
      redirectUrl.searchParams.set("allowedIdsCount", String(adminUserIds.length))
      console.error("Auth rejected: Supabase user id is not in ADMIN_USER_ID_ARR", {
        userId: data.user.id,
        adminUserIds,
      })
      return NextResponse.redirect(redirectUrl)
    }

    cookieStore.delete(ADMIN_PASSWORD_COOKIE)
    return NextResponse.redirect(new URL(localizePath("/", locale), publicOrigin))
  } catch (error) {
    console.error("Unexpected error in auth route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
