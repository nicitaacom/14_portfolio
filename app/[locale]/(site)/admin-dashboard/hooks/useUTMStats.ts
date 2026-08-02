import { useCallback, useEffect, useRef, useState } from "react"
import { selectDBUTMStatsAction } from "../actions/selectDBUTMStatsAction"
import type { TUTMTimeRange } from "../types/TUTMTimeRange"
import type { TUTMAggregatedStats } from "../types/TUTMAggregatedStats"

export function useUTMStats() {
  const [timeRange, setTimeRange] = useState<TUTMTimeRange>("1m")
  const [utmStats, setUtmStats] = useState<TUTMAggregatedStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchStats = useCallback(async (range: TUTMTimeRange) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsLoading(true)
    setError(null)

    const selectDBUTMStatsActionResp = await selectDBUTMStatsAction(range)

    if (requestIdRef.current !== requestId) return

    if (typeof selectDBUTMStatsActionResp === "string") {
      setError(selectDBUTMStatsActionResp)
      setUtmStats(null)
    } else {
      setUtmStats(selectDBUTMStatsActionResp)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    void fetchStats(timeRange)
  }, [fetchStats, timeRange])

  const refetch = useCallback(() => {
    void fetchStats(timeRange)
  }, [fetchStats, timeRange])

  return { utmStats, isLoading, error, timeRange, setTimeRange, refetch }
}
