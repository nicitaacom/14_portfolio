import moment from "moment-timezone"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import { RATE_LIMITS } from "@/consts/RATE_LIMITS"
import { TRateLimiterName } from "@/interfaces/TRateLimiterName"

const limiterCache = new Map<string, Ratelimit>()
const redis = Redis.fromEnv()

function getRateLimiter(rateLimiterName: TRateLimiterName) {
  if (limiterCache.has(rateLimiterName)) return limiterCache.get(rateLimiterName)!

  const spec = RATE_LIMITS[rateLimiterName]
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(spec.maxAllowed, `${spec.windowSec} s`),
  })

  limiterCache.set(rateLimiterName, limiter)
  return limiter
}

function getRateLimitKey(payload: Pick<API.RateLimitRequest, "limiterName" | "userCookieId">) {
  const rateLimitDef = RATE_LIMITS[payload.limiterName as TRateLimiterName]
  return rateLimitDef.key({ userCookieId: payload.userCookieId ?? undefined })
}

export function formatRateLimitReset(reset: number, timezone: string) {
  return moment(reset * 1000)
    .tz(timezone)
    .format("YYYY-MM-DD HH:mm:ss")
}

export async function getRateLimitRemaining(payload: Pick<API.RateLimitRequest, "limiterName" | "userCookieId"> & { ip: string }) {
  const limiter = getRateLimiter(payload.limiterName as TRateLimiterName)
  const fullKey = `${payload.ip}-${getRateLimitKey(payload)}`
  return limiter.getRemaining(fullKey)
}

export async function consumeRateLimit(payload: Pick<API.RateLimitRequest, "limiterName" | "userCookieId"> & { ip: string }) {
  const limiter = getRateLimiter(payload.limiterName as TRateLimiterName)
  const fullKey = `${payload.ip}-${getRateLimitKey(payload)}`
  return limiter.limit(fullKey)
}
