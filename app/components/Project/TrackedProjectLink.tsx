"use client"

import type { MouseEvent, ReactNode } from "react"
import { useMemo } from "react"
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
  const projectClicksSDK = useMemo(() => new ProjectClicksSDK(), [])

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const userTimezone = getUserTimezone()
    const userCookieId = getUserCookieId()

    projectClicksSDK
      .trackProjectClick({
        projectSlug,
        projectName,
        projectGroup,
        linkType,
        destinationUrl: href,
        pagePath: typeof window !== "undefined" ? window.location.pathname : "/",
        userCookieId,
        userTimezone,
        userLocalDate: moment().tz(userTimezone).format("YYYY-MM-DD"),
      })
      .catch(error => {
        console.error("Failed to track project click:", error)
      })

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
