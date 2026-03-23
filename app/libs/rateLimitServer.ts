import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import { RATE_LIMITS } from "@/consts/RATE_LIMITS"
import { TRateLimiterName } from "@/interfaces/TRateLimiterName"

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const limiterCache = new Map<string, Ratelimit>()
const ephemeralCache = new Map<string, number>()
const redis = Redis.fromEnv()

type RateLimitPayload = {
  limiterName: TRateLimiterName
  ip: string
  userCookieId?: string
}

function getRateLimitAlgorithm(rateLimiterName: TRateLimiterName) {
  const spec = RATE_LIMITS[rateLimiterName]
  return spec.mode === "fixedWindow"
    ? Ratelimit.fixedWindow(spec.maxAllowed, `${spec.windowSec} s`)
    : Ratelimit.slidingWindow(spec.maxAllowed, `${spec.windowSec} s`)
}

function getRateLimiter(rateLimiterName: TRateLimiterName) {
  if (limiterCache.has(rateLimiterName)) return limiterCache.get(rateLimiterName)!

  const limiter = new Ratelimit({
    redis,
    limiter: getRateLimitAlgorithm(rateLimiterName),
    analytics: false,
    enableProtection: false,
    timeout: 1000,
    ephemeralCache,
  })

  limiterCache.set(rateLimiterName, limiter)
  return limiter
}

function getRateLimitKey(payload: RateLimitPayload) {
  const rateLimitDef = RATE_LIMITS[payload.limiterName]
  return rateLimitDef.key({
    ip: payload.ip,
    userCookieId: payload.userCookieId,
  })
}

export function getRequestIp(headers: Headers) {
  const realIp = headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  const forwardedFor = headers.get("x-forwarded-for")?.trim()
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",")
    if (firstIp?.trim()) return firstIp.trim()
  }

  return "127.0.0.1"
}

export function getRetryAfterSeconds(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000))
}

export function getRateLimitHeaders(result: Pick<RateLimitResult, "limit" | "remaining" | "reset">) {
  return {
    "retry-after": `${getRetryAfterSeconds(result.reset)}`,
    "x-ratelimit-limit": `${result.limit}`,
    "x-ratelimit-remaining": `${Math.max(0, result.remaining)}`,
    "x-ratelimit-reset": `${result.reset}`,
  }
}

export async function getRateLimitRemaining(payload: RateLimitPayload) {
  const limiter = getRateLimiter(payload.limiterName)
  const fullKey = getRateLimitKey(payload)
  return limiter.getRemaining(fullKey)
}

export async function consumeRateLimit(payload: RateLimitPayload) {
  const limiter = getRateLimiter(payload.limiterName)
  const fullKey = getRateLimitKey(payload)
  return limiter.limit(fullKey)
}
