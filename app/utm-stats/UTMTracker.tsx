"use client"

import { useEffect } from "react"
import { computeFingerprint } from "./computeFingerprint"
import { useDeviceIdStore } from "@/store/useDeviceIdStore"
import { useFingerprintStore } from "@/store/useFingerprintStore"
import { trackVisitAction } from "./actions/trackVisitAction"

const FINGERPRINT_TTL_MS = 10 * 60 * 1000

export function UTMTracker() {
  useEffect(() => {
    const { deviceId, setDeviceId } = useDeviceIdStore.getState()
    const { fingerprint: storedFingerprint, computedAt, setFingerprint } = useFingerprintStore.getState()
    const params = Object.fromEntries(new URLSearchParams(window.location.search).entries())
    const currentUrl = `${window.location.pathname}${window.location.search}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    async function trackVisit() {
      const isFingerprintFresh = storedFingerprint && computedAt && Date.now() - computedAt < FINGERPRINT_TTL_MS
      const fingerprint = isFingerprintFresh ? storedFingerprint : await computeFingerprint()
      if (!isFingerprintFresh) setFingerprint(fingerprint, Date.now())

      const result = await trackVisitAction(deviceId, params, currentUrl, timezone, fingerprint)
      if (result && result.deviceId !== deviceId) setDeviceId(result.deviceId)

      const url = window.location.origin + window.location.pathname
      window.history.replaceState({}, "", url)
    }

    trackVisit()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
