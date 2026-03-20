import { TRateLimiterName } from "@/interfaces/TRateLimiterName"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { getCookie } from "@/utils/helpersCSR"

type Action = API.RateLimitRequest["action"]

export class RateLimitSDK {
  async rateLimit(limiterName: TRateLimiterName): Promise<API.RateLimitResponse> {
    return this.requestFn("rateLimit", limiterName)
  }

  async getRemaining(limiterName: TRateLimiterName): Promise<API.RateLimitResponse> {
    return this.requestFn("getRemaining", limiterName)
  }

  private async requestFn(action: Action, limiterName: TRateLimiterName): Promise<API.RateLimitResponse> {
    const { selectedTimezone: userTimezone } = useSelectedTimezoneStore.getState()
    const userCookieId = getCookie("user_cookie_id")

    if (!userCookieId) throw new Error("user_cookie_id is required for rate limit")

    const response = await fetch("/api/rate-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        limiterName,
        userTimezone,
        userCookieId,
      } satisfies API.RateLimitRequest),
    })

    if (response.status === 429) throw new Error("Rate limit exceeded")
    if (!response.ok) throw new Error("Rate limit request failed")

    return (await response.json()) as API.RateLimitResponse
  }
}
