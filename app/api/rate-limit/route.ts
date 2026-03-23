import moment from "moment-timezone"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { consumeRateLimit, getRateLimitHeaders, getRateLimitRemaining, getRequestIp, getRetryAfterSeconds } from "@/libs/rateLimitServer"

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

  const requestHeaders = headers()
  const ip = getRequestIp(requestHeaders)

  const rateLimitApiResult = await consumeRateLimit({
    limiterName: "rateLimitApi",
    userCookieId,
    ip,
  })

  if (!rateLimitApiResult.success) {
    return NextResponse.json(
      { error: "Too many rate limit checks. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitApiResult),
      },
    )
  }

  if (limiterName !== "bookACall" && limiterName !== "adminPasswordAttempt") {
    return NextResponse.json({ error: `Limiter ${limiterName} is not public` }, { status: 400 })
  }

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
      const publicRateLimitResult = await consumeRateLimit({
        limiterName,
        userCookieId,
        ip,
      })

      if (!publicRateLimitResult.success) {
        const retryAfter = getRetryAfterSeconds(publicRateLimitResult.reset)
        return NextResponse.json(
          { error: `Please try again in ${retryAfter} seconds` },
          {
            status: 429,
            headers: {
              ...getRateLimitHeaders(publicRateLimitResult),
              ["retry-after"]: `${retryAfter}`,
            },
          },
        )
      }

      return NextResponse.json(
        {
          remaining: publicRateLimitResult.remaining,
          resetTime: moment(publicRateLimitResult.reset)
            .tz(userTimezone)
            .format("YYYY-MM-DD HH:mm:ss"),
        } satisfies API.RateLimitResponse,
        { status: 200 },
      )
    }

    return NextResponse.json({ error: "action not recognized - use either rateLimit or getRemaining" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
