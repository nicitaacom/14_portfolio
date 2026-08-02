"use client"

import { useEffect } from "react"
import { computeFingerprint } from "./computeFingerprint"
import { useDeviceIdStore } from "@/store/useDeviceIdStore"
import { trackVisitAction } from "./actions/trackVisitAction"

export function UTMTracker() {
  useEffect(() => {
    const { deviceId, setDeviceId } = useDeviceIdStore.getState()
    const params = Object.fromEntries(new URLSearchParams(window.location.search).entries())
    const currentUrl = `${window.location.pathname}${window.location.search}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // The fingerprint sits behind localStorage/cookie and the IP mapping, and only the server can
    // see whether those hit - the cookie is httpOnly and the IP mapping is in Redis. So the first
    // call sends no fingerprint at all and the server answers needsFingerprint when it needs one.
    // Canvas and WebGL reads cost real time on the main thread and every returning visitor used to
    // pay it for a value that nothing then read.
    async function trackVisit() {
      let trackVisitActionResp = await trackVisitAction(deviceId, params, currentUrl, timezone)

      if ("needsFingerprint" in trackVisitActionResp) {
        // "" tells the server this browser tried and had nothing to offer, so it mints a new
        // deviceId rather than asking again.
        const fingerprint = await computeFingerprint().catch(() => "")
        trackVisitActionResp = await trackVisitAction(deviceId, params, currentUrl, timezone, fingerprint)
      }

      // The store only ever holds the transport form, so this compares and writes that - the signed
      // id itself never reaches the browser.
      if ("storedDeviceId" in trackVisitActionResp && trackVisitActionResp.storedDeviceId !== deviceId) {
        setDeviceId(trackVisitActionResp.storedDeviceId)
      }

      // Only once the visit is recorded - the utm params in the URL are the attribution, so
      // stripping them after a failed call would lose it for good. Left in place they get one more
      // chance on the next render.
      const url = window.location.origin + window.location.pathname
      window.history.replaceState({}, "", url)
    }

    void trackVisit().catch(error => console.error("Error tracking UTM visit:", error))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
