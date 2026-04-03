import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { ADMIN_PASSWORD_COOKIE, parseAdminUserIdArr } from "@/libs/adminAuth"

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

// Named export for GET request handling
export async function GET(request: Request) {
  // 1. Parse the request URL and extract the authorization code
  const requestUrl = new URL(request.url)
  const publicOrigin = getPublicOrigin(request)
  const code = requestUrl.searchParams.get("code")

  // 2. Check if the code exists; if not, return an error response
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  try {
    // 3. Initialize Supabase client with route handler configuration
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )

    // 4. Exchange the authorization code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // 5. Handle any errors from the exchange process
    if (error) {
      console.error("Auth exchange error:", error.message)
      return NextResponse.json({ error: "Failed to authenticate", details: error.message }, { status: 401 })
    }

    // 6. Verify session data and user existence
    if (!data.session || !data.user || !data.user.email) {
      return NextResponse.json({ error: "Invalid session or user data" }, { status: 401 })
    }

    const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)

    if (adminUserIds.length > 0 && !adminUserIds.includes(data.user.id)) {
      await supabase.auth.signOut()
      cookies().delete(ADMIN_PASSWORD_COOKIE)
      const redirectUrl = new URL("/auth", publicOrigin)
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

    // 7. Successfully authenticated; redirect to origin
    cookies().delete(ADMIN_PASSWORD_COOKIE)
    return NextResponse.redirect(new URL("/", publicOrigin))
  } catch (error) {
    // 8. Catch unexpected errors (e.g., network issues)
    console.error("Unexpected error in auth route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
