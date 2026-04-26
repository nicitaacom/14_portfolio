type RateLimitKeyParams = {
  ip?: string
  userCookieId?: string
}

type RateLimitSpec = {
  windowSec: number
  maxAllowed: number
  mode: "fixedWindow" | "slidingWindow"
  key: (params: RateLimitKeyParams) => string
}

const getCurrentUtcDateKey = () => new Date().toISOString().slice(0, 10)

const requireIp = (ip: string | undefined, limiterName: string) => {
  if (!ip) throw Error(`ip is required for ${limiterName}`)
  return ip
}

const requireUserCookieId = (userCookieId: string | undefined, limiterName: string) => {
  if (!userCookieId) throw Error(`userCookieId is required for ${limiterName}`)
  return userCookieId
}

export const PUBLIC_RATE_LIMITS = {
  bookACall: {
    windowSec: 86400,
    maxAllowed: 2,
    mode: "fixedWindow",
    key: ({ ip, userCookieId }) => {
      return `appointment:new:${getCurrentUtcDateKey()}:${requireIp(ip, "bookACall")}:${requireUserCookieId(
        userCookieId,
        "bookACall",
      )}`
    },
  },
  adminPasswordAttempt: {
    windowSec: 600,
    maxAllowed: 2,
    mode: "slidingWindow",
    key: ({ ip }) => `auth:admin-password:${requireIp(ip, "adminPasswordAttempt")}`,
  },
} as const satisfies Record<string, RateLimitSpec>

export const INTERNAL_RATE_LIMITS = {
  pageRequest: {
    windowSec: 60,
    maxAllowed: 22,
    mode: "slidingWindow",
    key: ({ ip }) => `page:${requireIp(ip, "pageRequest")}`,
  },
  bookingSubmitBurst: {
    windowSec: 600,
    maxAllowed: 5,
    mode: "slidingWindow",
    key: ({ ip }) => `booking:submit:${requireIp(ip, "bookingSubmitBurst")}`,
  },
  projectLinkClick: {
    windowSec: 600,
    maxAllowed: 7,
    mode: "slidingWindow",
    key: ({ ip, userCookieId }) => `analytics:project-link:${requireIp(ip, "projectLinkClick")}:${userCookieId ?? "anonymous"}`,
  },
  rateLimitApi: {
    windowSec: 300,
    maxAllowed: 7,
    mode: "slidingWindow",
    key: ({ ip, userCookieId }) => `rate-limit-api:${requireIp(ip, "rateLimitApi")}:${userCookieId ?? "anonymous"}`,
  },
} as const satisfies Record<string, RateLimitSpec>

export const RATE_LIMITS = {
  ...PUBLIC_RATE_LIMITS,
  ...INTERNAL_RATE_LIMITS,
} as const satisfies Record<string, RateLimitSpec>
