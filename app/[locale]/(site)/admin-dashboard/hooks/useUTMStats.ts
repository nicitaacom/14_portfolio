import { useCallback, useEffect, useRef, useState } from "react"
import { selectDBUTMStatsAction } from "../actions/selectDBUTMStatsAction"
import type { TUTMTimeRange } from "../types/TUTMTimeRange"
import type { TUTMAggregatedStats } from "../types/TUTMAggregatedStats"

export function useUTMStats() {
  const [timeRange, setTimeRange] = useState<TUTMTimeRange>("1m")
  const [utmStats, setUtmStats] = useState<TUTMAggregatedStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [settledRange, setSettledRange] = useState<TUTMTimeRange | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchStats = useCallback(async (range: TUTMTimeRange) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsLoading(true)
    setError(null)

    try {
      const selectDBUTMStatsActionResp = await selectDBUTMStatsAction(range)
      if (requestIdRef.current !== requestId) return
      if (typeof selectDBUTMStatsActionResp === "string") throw new Error(selectDBUTMStatsActionResp)
      setUtmStats(selectDBUTMStatsActionResp)
    } catch (error) {
      if (requestIdRef.current !== requestId) return
      setError(error instanceof Error ? error.message : "Failed to load traffic data")
      setUtmStats(null)
    } finally {
      if (requestIdRef.current === requestId) {
        setSettledRange(range)
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void fetchStats(timeRange)
    return () => { requestIdRef.current += 1 }
  }, [fetchStats, timeRange])

  const refetch = useCallback(() => {
    void fetchStats(timeRange)
  }, [fetchStats, timeRange])

  return {
    utmStats: utmStats?.timeRange === timeRange ? utmStats : null,
    isLoading: isLoading || settledRange !== timeRange,
    error: settledRange === timeRange ? error : null,
    timeRange,
    setTimeRange,
    refetch,
  }
}
