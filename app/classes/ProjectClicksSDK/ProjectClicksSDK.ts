import type { TProjectClicksTimelineMode } from "../../[locale]/(site)/admin-dashboard/types/TProjectClicksTimelineMode"

const ADMIN_PROJECT_CLICKS_API_URL = "/api/admin/project-clicks"
const PROJECT_LINK_CLICK_API_URL = "/api/analytics/project-link-click"

export class ProjectClicksSDK {
  private async getResponseDataFn<T>(response: Response): Promise<T | { error?: string } | null> {
    return (await response.json().catch(() => null)) as T | { error?: string } | null
  }

  private getErrorMessageFn(responseData: Record<string, unknown> | null, fallbackMessage: string) {
    return responseData && typeof responseData.error === "string" ? responseData.error : fallbackMessage
  }

  async selectProjectClicksDashboard(
    projectSlug: string,
    timelineMode: TProjectClicksTimelineMode,
    signal?: AbortSignal,
  ): Promise<API.AdminProjectClicksResponse> {
    const searchParams = new URLSearchParams({ scope: "all", projectSlug, timelineMode })
    const response = await fetch(`${ADMIN_PROJECT_CLICKS_API_URL}?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
      signal,
    })
    const responseData = await this.getResponseDataFn<API.AdminProjectClicksResponse>(response)
    if (!response.ok) {
      throw new Error(this.getErrorMessageFn(responseData, "Failed to load project clicks"))
    }
    if (!responseData || !("overview" in responseData) || !("timeline" in responseData) || !("period" in responseData)
      || !Array.isArray(responseData.overview) || !Array.isArray(responseData.timeline) || !responseData.period) {
      throw new Error("Invalid project clicks response")
    }
    return responseData
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

    if (!responseData || !("overview" in responseData) || !Array.isArray(responseData.overview)) {
      throw new Error("Invalid project clicks overview response")
    }
    return responseData.overview
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

    if (!responseData || !("timeline" in responseData) || !Array.isArray(responseData.timeline)) {
      throw new Error("Invalid project clicks timeline response")
    }
    return responseData.timeline
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
