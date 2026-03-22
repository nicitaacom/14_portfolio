import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ProjectClicksSDK } from "@/classes/ProjectClicksSDK/ProjectClicksSDK"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import { useProjectClicksDashboard } from "../store/useProjectClicksDashboard"

const mapProjectClicksOverviewFn = (row: API.ProjectClicksOverviewRow): TProjectClicksOverviewDB => ({
  project_slug: row.project_slug ?? "",
  project_name: row.project_name ?? "Unnamed project",
  project_group: row.project_group ?? "projects",
  total_clicks: Number(row.total_clicks ?? 0),
  demo_clicks: Number(row.demo_clicks ?? 0),
  github_clicks: Number(row.github_clicks ?? 0),
  figma_clicks: Number(row.figma_clicks ?? 0),
  youtube_clicks: Number(row.youtube_clicks ?? 0),
})

const mapProjectClicksTimelineFn = (row: API.ProjectClicksTimelineRow): TProjectClicksTimelineDB => ({
  bucket_key: row.bucket_key ?? "",
  bucket_label: row.bucket_label ?? "",
  total_clicks: Number(row.total_clicks ?? 0),
})

export const useSetProjectClicksDashboard = () => {
  const {
    selectedProjectSlug,
    timelineMode,
    setOverview,
    setTimeline,
    setCurrentState,
    setOverviewErrorMessage,
    setTimelineErrorMessage,
  } = useProjectClicksDashboard()
  const projectClicksSDK = useMemo(() => new ProjectClicksSDK(), [])
  const [isOverviewSkeleton, setIsOverviewSkeleton] = useState(false)
  const [isTimelineSkeleton, setIsTimelineSkeleton] = useState(false)
  const overviewRequestIdRef = useRef(0)
  const timelineRequestIdRef = useRef(0)

  const fetchOverviewFn = useCallback(async (): Promise<TProjectClicksOverviewDB[]> => {
    const requestId = overviewRequestIdRef.current + 1
    overviewRequestIdRef.current = requestId

    setCurrentState("fetching")
    setOverviewErrorMessage("")
    setIsOverviewSkeleton(true)

    try {
      const response = await projectClicksSDK.selectProjectClicksOverview(timelineMode)
      const mappedOverview = response.map(mapProjectClicksOverviewFn)

      if (overviewRequestIdRef.current === requestId) {
        setOverview(mappedOverview)
        setCurrentState("up to date")
      }

      return mappedOverview
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (overviewRequestIdRef.current === requestId) {
        setOverview([])
        setOverviewErrorMessage(errorMessage)
        setCurrentState("up to date")
      }

      return []
    } finally {
      if (overviewRequestIdRef.current === requestId) {
        setIsOverviewSkeleton(false)
      }
    }
  }, [projectClicksSDK, setCurrentState, setOverview, setOverviewErrorMessage, timelineMode])

  const fetchTimelineFn = useCallback(async (): Promise<TProjectClicksTimelineDB[]> => {
    const requestId = timelineRequestIdRef.current + 1
    timelineRequestIdRef.current = requestId

    setCurrentState("fetching")
    setTimelineErrorMessage("")
    setIsTimelineSkeleton(true)

    try {
      const response = await projectClicksSDK.selectProjectClicksTimeline(selectedProjectSlug, timelineMode)
      const mappedTimeline = response.map(mapProjectClicksTimelineFn)

      if (timelineRequestIdRef.current === requestId) {
        setTimeline(mappedTimeline)
        setCurrentState("up to date")
      }

      return mappedTimeline
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (timelineRequestIdRef.current === requestId) {
        setTimeline([])
        setTimelineErrorMessage(errorMessage)
        setCurrentState("up to date")
      }

      return []
    } finally {
      if (timelineRequestIdRef.current === requestId) {
        setIsTimelineSkeleton(false)
      }
    }
  }, [projectClicksSDK, selectedProjectSlug, setCurrentState, setTimeline, setTimelineErrorMessage, timelineMode])

  useEffect(() => {
    fetchOverviewFn()
  }, [fetchOverviewFn])

  useEffect(() => {
    fetchTimelineFn()
  }, [fetchTimelineFn])

  const refetch = useCallback(async () => {
    await Promise.all([fetchOverviewFn(), fetchTimelineFn()])
  }, [fetchOverviewFn, fetchTimelineFn])

  return { refetch, isOverviewSkeleton, isTimelineSkeleton }
}
