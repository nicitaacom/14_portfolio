import moment from "moment-timezone"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { consumeRateLimit, formatRateLimitReset, getRateLimitRemaining } from "@/libs/rateLimitServer"

export async function POST(req: Request) {
  const { limiterName, action, userTimezone, userCookieId } = (await req.json()) as API.RateLimitRequest

  if (!limiterName || !userTimezone) {
    return NextResponse.json(
      { error: `Something is missing \n limiterName: ${limiterName} \n userTimezone: ${userTimezone}` },
      { status: 400 },
    )
  }

  if (!moment.tz.zone(userTimezone)) {
    return NextResponse.json({ error: `Invalid timezone: ${userTimezone}` }, { status: 400 })
  }

  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  try {
    if (action === "getRemaining") {
      const remaining = await getRateLimitRemaining({
        limiterName,
        userCookieId,
        ip,
      })

      return NextResponse.json(
        {
          remaining,
        } satisfies API.RateLimitResponse,
        { status: 200 },
      )
    }

    if (action === "rateLimit") {
      const { success, remaining, reset } = await consumeRateLimit({
        limiterName,
        userCookieId,
        ip,
      })

      if (!success) {
        const retryAfter = Math.max(1, Math.floor((reset * 1000 - Date.now()) / 1000))
        return NextResponse.json(
          { error: `Please try again in ${retryAfter} seconds` },
          {
            status: 429,
            headers: { ["retry-after"]: `${retryAfter}` },
          },
        )
      }

      return NextResponse.json(
        {
          remaining,
          resetTime: formatRateLimitReset(reset, userTimezone),
        } satisfies API.RateLimitResponse,
        { status: 200 },
      )
    }

    return NextResponse.json({ error: "action not recognized - use either rateLimit or getRemaining" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
