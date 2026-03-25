import type { TProjectClicksTimelineMode } from "@/(site)/admin-dashboard/types/TProjectClicksTimelineMode"

const ADMIN_PROJECT_CLICKS_API_URL = "/api/admin/project-clicks"
const PROJECT_LINK_CLICK_API_URL = "/api/analytics/project-link-click"

export class ProjectClicksSDK {
  private async getResponseDataFn<T>(response: Response): Promise<T | { error?: string } | null> {
    return (await response.json().catch(() => null)) as T | { error?: string } | null
  }

  private getErrorMessageFn(responseData: Record<string, unknown> | null, fallbackMessage: string) {
    return responseData && typeof responseData.error === "string" ? responseData.error : fallbackMessage
  }

  async selectProjectClicksOverview(timelineMode: TProjectClicksTimelineMode): Promise<API.ProjectClicksOverviewRow[]> {
    const searchParams = new URLSearchParams({
      scope: "overview",
      timelineMode,
    })

    const response = await fetch(`${ADMIN_PROJECT_CLICKS_API_URL}?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
    })
    const responseData = await this.getResponseDataFn<API.AdminProjectClicksResponse>(response)

    if (!response.ok) {
      throw new Error(this.getErrorMessageFn(responseData, "Failed to fetch project clicks overview"))
    }

    return responseData && "overview" in responseData ? responseData.overview ?? [] : []
  }

  async selectProjectClicksTimeline(
    projectSlug: string,
    timelineMode: TProjectClicksTimelineMode,
  ): Promise<API.ProjectClicksTimelineRow[]> {
    const searchParams = new URLSearchParams({
      scope: "timeline",
      projectSlug,
      timelineMode,
    })

    const response = await fetch(`${ADMIN_PROJECT_CLICKS_API_URL}?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
    })
    const responseData = await this.getResponseDataFn<API.AdminProjectClicksResponse>(response)

    if (!response.ok) {
      throw new Error(this.getErrorMessageFn(responseData, "Failed to fetch project clicks timeline"))
    }

    return responseData && "timeline" in responseData ? responseData.timeline ?? [] : []
  }

  async trackProjectClick(payload: API.TrackProjectLinkClickRequest): Promise<API.TrackProjectLinkClickResponse> {
    const response = await fetch(PROJECT_LINK_CLICK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    const responseData = await this.getResponseDataFn<API.TrackProjectLinkClickResponse>(response)

    if (!response.ok) {
      throw new Error(this.getErrorMessageFn(responseData, "Failed to track project click"))
    }

    return responseData && "ok" in responseData ? responseData : { ok: true }
  }
}
