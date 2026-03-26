// DO NOT import anything here

declare module API {
  type TrackedProjectGroup = "work" | "projects"
  type ProjectLinkClickType = "demo" | "github" | "figma" | "youtube"

  type AdminPasswordRequest = {
    password: string
  }

  type AdminPasswordResponse = {
    ok: boolean
    error?: string
  }

  type InsertBookingRequest = {
    bookingId: string
    selectedDate: string | null | [string | null, string | null]
    atMSK: string
    channel: "telegram" | "discord" | "google-meets"
    contactType: "telegram" | "discord" | "email" | "linkedin"
    contact: string
    isSendNotification: boolean
    sendNotificationTo: "tg" | "dis" | "email"
    inputNotificationTo: string
  }

  type InsertBookingResponse = {
    ok: boolean
    error?: string
  }

  type RateLimitRequest = {
    action: "rateLimit" | "getRemaining"
    limiterName: "bookACall" | "adminPasswordAttempt"
    userTimezone: string
    userCookieId?: string
  }

  type RateLimitResponse = {
    remaining: number
    resetTime?: string
    error?: string
  }

  type ProjectClicksTimelineMode = "monthly" | "yearly"

  type ProjectClicksOverviewRow = {
    project_slug: string
    project_name: string
    project_group: "work" | "projects"
    total_clicks: number
    demo_clicks: number
    github_clicks: number
    figma_clicks: number
    youtube_clicks: number
  }

  type ProjectClicksTimelineRow = {
    bucket_key: string
    bucket_label: string
    total_clicks: number
  }

  type AdminProjectClicksResponse = {
    overview: ProjectClicksOverviewRow[]
    timeline: ProjectClicksTimelineRow[]
  }

  type TrackProjectLinkClickRequest = {
    projectSlug: string
    projectName: string
    projectGroup: TrackedProjectGroup
    linkType: ProjectLinkClickType
    destinationUrl: string
    pagePath: string
    userCookieId?: string
    userTimezone: string
    userLocalDate: string
  }

  type TrackProjectLinkClickResponse = {
    ok: boolean
  }
}
