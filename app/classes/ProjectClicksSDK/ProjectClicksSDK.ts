import type { TProjectClicksTimelineMode } from "@/(site)/admin-dashboard/types/TProjectClicksTimelineMode"

export class ProjectClicksSDK {
  async selectProjectClicksOverview(timelineMode: TProjectClicksTimelineMode): Promise<API.ProjectClicksOverviewRow[]> {
    const searchParams = new URLSearchParams({
      scope: "overview",
      timelineMode,
    })

    const response = await fetch(`/api/admin/project-clicks?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
    })

    const responseData = (await response.json().catch(() => null)) as API.AdminProjectClicksResponse | { error?: string } | null

    if (!response.ok) {
      throw new Error(responseData && "error" in responseData && responseData.error ? responseData.error : "Failed to fetch project clicks overview")
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

    const response = await fetch(`/api/admin/project-clicks?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
    })

    const responseData = (await response.json().catch(() => null)) as API.AdminProjectClicksResponse | { error?: string } | null

    if (!response.ok) {
      throw new Error(responseData && "error" in responseData && responseData.error ? responseData.error : "Failed to fetch project clicks timeline")
    }

    return responseData && "timeline" in responseData ? responseData.timeline ?? [] : []
  }

  async trackProjectClick(payload: API.TrackProjectLinkClickRequest): Promise<API.TrackProjectLinkClickResponse> {
    const response = await fetch("/api/analytics/project-link-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    })

    const responseData = (await response.json().catch(() => null)) as API.TrackProjectLinkClickResponse | { error?: string } | null

    if (!response.ok) {
      throw new Error(responseData && "error" in responseData && responseData.error ? responseData.error : "Failed to track project click")
    }

    return responseData && "ok" in responseData ? responseData : { ok: true }
  }
}
