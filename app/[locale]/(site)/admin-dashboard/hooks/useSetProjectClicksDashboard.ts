import { useCallback, useEffect, useRef, useState } from "react"
import { ProjectClicksSDK } from "@/classes/ProjectClicksSDK/ProjectClicksSDK"
import { useProjectClicksDashboard } from "../store/useProjectClicksDashboard"

const projectClicksSDK = new ProjectClicksSDK()

export const useSetProjectClicksDashboard = () => {
  const {
    selectedProjectSlug,
    timelineMode,
    setDashboardData,
    setCurrentState,
    setOverviewErrorMessage,
    setTimelineErrorMessage,
  } = useProjectClicksDashboard()
  const [isLoading, setIsLoading] = useState(true)
  const [settledRequestKey, setSettledRequestKey] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const controllerRef = useRef<AbortController | null>(null)

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setCurrentState("fetching")
    setOverviewErrorMessage("")
    setTimelineErrorMessage("")
    setIsLoading(true)

    try {
      const response = await projectClicksSDK.selectProjectClicksDashboard(selectedProjectSlug, timelineMode, controller.signal)
      if (requestId !== requestIdRef.current) return
      setDashboardData(response)
      setCurrentState("up to date")
    } catch (error) {
      if (requestId !== requestIdRef.current || controller.signal.aborted) return
      const message = error instanceof Error ? error.message : "Failed to load project clicks"
      setDashboardData({ overview: [], timeline: [], period: null })
      setOverviewErrorMessage(message)
      setTimelineErrorMessage(message)
      setCurrentState("idle")
    } finally {
      if (requestId === requestIdRef.current) {
        setSettledRequestKey(`${selectedProjectSlug}:${timelineMode}`)
        setIsLoading(false)
      }
    }
  }, [selectedProjectSlug, timelineMode, setDashboardData, setCurrentState, setOverviewErrorMessage, setTimelineErrorMessage])

  useEffect(() => {
    void refetch()
    return () => {
      requestIdRef.current += 1
      controllerRef.current?.abort()
    }
  }, [refetch])

  const pending = isLoading || settledRequestKey !== `${selectedProjectSlug}:${timelineMode}`
  return { refetch, isOverviewSkeleton: pending, isTimelineSkeleton: pending }
}
