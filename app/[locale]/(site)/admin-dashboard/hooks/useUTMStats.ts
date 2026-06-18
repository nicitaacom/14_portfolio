import { useCallback, useEffect, useRef, useState } from "react"
import { selectDBUTMStatsAction, type UTMAggregatedStats } from "../actions/selectDBUTMStatsAction"
import type { TUTMTimeRange } from "../types/TUTMTimeRange"

export function useUTMStats() {
  const [timeRange, setTimeRange] = useState<TUTMTimeRange>("1m")
  const [utmStats, setUtmStats] = useState<UTMAggregatedStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchStats = useCallback(async (range: TUTMTimeRange) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsLoading(true)
    setError(null)

    const result = await selectDBUTMStatsAction(range)

    if (requestIdRef.current !== requestId) return

    if (typeof result === "string") {
      setError(result)
      setUtmStats(null)
    } else {
      setUtmStats(result)
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
