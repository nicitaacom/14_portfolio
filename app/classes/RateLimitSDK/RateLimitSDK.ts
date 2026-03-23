import { TPublicRateLimiterName } from "@/interfaces/TPublicRateLimiterName"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { getCookie } from "@/utils/helpersCSR"

type Action = API.RateLimitRequest["action"]

export class RateLimitSDK {
  async rateLimit(limiterName: TPublicRateLimiterName): Promise<API.RateLimitResponse> {
    return this.requestFn("rateLimit", limiterName)
  }

  async getRemaining(limiterName: TPublicRateLimiterName): Promise<API.RateLimitResponse> {
    return this.requestFn("getRemaining", limiterName)
  }

  private async requestFn(action: Action, limiterName: TPublicRateLimiterName): Promise<API.RateLimitResponse> {
    const { selectedTimezone: userTimezone } = useSelectedTimezoneStore.getState()
    const userCookieId = getCookie("user_cookie_id")

    const response = await fetch("/api/rate-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        limiterName,
        userTimezone,
        userCookieId: userCookieId ?? undefined,
      } satisfies API.RateLimitRequest),
    })

    const responseData = (await response.json().catch(() => null)) as API.RateLimitResponse | { error?: string } | null

    if (response.status === 429) {
      throw new Error(responseData && "error" in responseData && responseData.error ? responseData.error : "Rate limit exceeded")
    }

    if (!response.ok) {
      throw new Error(responseData && "error" in responseData && responseData.error ? responseData.error : "Rate limit request failed")
    }

    return responseData && "remaining" in responseData ? responseData : { remaining: 0 }
  }
}
