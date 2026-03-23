import { Database } from "@/interfaces/types_db"
import { consumeRateLimit, getRateLimitHeaders, getRequestIp } from "@/libs/rateLimitServer"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") {
    const ip = getRequestIp(req.headers)
    const rateLimitResult = await consumeRateLimit({
      limiterName: "pageRequest",
      ip,
    })

    if (!rateLimitResult.success) {
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      })
    }
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  )
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|WEB.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
