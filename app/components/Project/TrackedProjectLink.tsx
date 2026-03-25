"use client"

import type { MouseEvent, ReactNode } from "react"
import moment from "moment-timezone"
import { nanoid } from "nanoid"
import { ProjectClicksSDK } from "@/classes/ProjectClicksSDK/ProjectClicksSDK"
import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"
import { getCookie, setCookie } from "@/utils/helpersCSR"

interface TrackedProjectLinkProps {
  children: ReactNode
  className?: string
  href: string
  linkType: API.ProjectLinkClickType
  projectGroup: TTrackedProjectGroup
  projectName: string
  projectSlug: string
  title?: string
}

const projectClicksSDK = new ProjectClicksSDK()

function getUserCookieId() {
  const existingCookieId = getCookie("user_cookie_id")
  if (existingCookieId) return existingCookieId

  const nextCookieId = nanoid()
  setCookie("user_cookie_id", nextCookieId, 365)
  return nextCookieId
}

function getUserTimezone() {
  return moment.tz.guess() || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}

export function TrackedProjectLink({
  children,
  className = "",
  href,
  linkType,
  projectGroup,
  projectName,
  projectSlug,
  title,
}: TrackedProjectLinkProps) {
  function trackProjectClickFn(payload: API.TrackProjectLinkClickRequest) {
    const requestBody = JSON.stringify(payload)
    const isTrackedWithBeacon =
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/analytics/project-link-click", new Blob([requestBody], { type: "application/json" }))

    if (isTrackedWithBeacon) return

    projectClicksSDK.trackProjectClick(payload).catch(error => {
      console.error("Failed to track project click:", error)
    })
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const userTimezone = getUserTimezone()
    const userCookieId = getUserCookieId()
    const payload: API.TrackProjectLinkClickRequest = {
      projectSlug,
      projectName,
      projectGroup,
      linkType,
      destinationUrl: href,
      pagePath: typeof window !== "undefined" ? window.location.pathname : "/",
      userCookieId,
      userTimezone,
      userLocalDate: moment().tz(userTimezone).format("YYYY-MM-DD"),
    }

    trackProjectClickFn(payload)
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <a
      className={className}
      href={href}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
      title={title}>
      {children}
    </a>
  )
}
