type RateLimitKeyParams = { userCookieId?: string }

export const RATE_LIMITS = {
  bookACall: {
    windowSec: 72000,
    maxAllowed: 2,
    key: ({ userCookieId }: RateLimitKeyParams) => {
      if (!userCookieId) throw Error("userCookieId is required for bookACall")
      return `appointment:new-${userCookieId}`
    },
  },
} as const
