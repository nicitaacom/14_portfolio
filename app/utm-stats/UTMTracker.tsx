"use client"

import { useEffect } from "react"
import { trackVisitAction } from "./actions/trackVisitAction"

export function UTMTracker({ userId }: { userId: string | undefined }) {
  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search).entries())
    const currentUrl = `${window.location.pathname}${window.location.search}`

    async function trackVisit() {
      await trackVisitAction(userId, params, currentUrl)
      const url = window.location.origin + window.location.pathname
      window.history.replaceState({}, "", url)
    }

    trackVisit()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
