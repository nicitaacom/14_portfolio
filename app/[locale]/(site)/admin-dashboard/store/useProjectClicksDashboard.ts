import { trackedProjects } from "@/data/repos"
import { create } from "zustand"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"
import type { TAnalyticsPeriod } from "../types/TAnalyticsPeriod"

interface ProjectClicksDashboardStore {
  overview: TProjectClicksOverviewDB[]
  setOverview: (overview: TProjectClicksOverviewDB[]) => void

  timeline: TProjectClicksTimelineDB[]
  setTimeline: (timeline: TProjectClicksTimelineDB[]) => void

  period: TAnalyticsPeriod | null
  setPeriod: (period: TAnalyticsPeriod | null) => void

  setDashboardData: (data: {
    overview: TProjectClicksOverviewDB[]
    timeline: TProjectClicksTimelineDB[]
    period: TAnalyticsPeriod | null
  }) => void

  selectedProjectSlug: string
  setSelectedProjectSlug: (selectedProjectSlug: string) => void

  timelineMode: TProjectClicksTimelineMode
  setTimelineMode: (timelineMode: TProjectClicksTimelineMode) => void

  currentState: "idle" | "fetching" | "up to date"
  setCurrentState: (currentState: "idle" | "fetching" | "up to date") => void

  overviewErrorMessage: string
  setOverviewErrorMessage: (overviewErrorMessage: string) => void

  timelineErrorMessage: string
  setTimelineErrorMessage: (timelineErrorMessage: string) => void
}

const DEFAULT_PROJECT_SLUG = trackedProjects[0]?.slug ?? "project-riz-admin-dashboard"

export const useProjectClicksDashboard = create<ProjectClicksDashboardStore>()(set => ({
  overview: [],
  setOverview: overview => set({ overview }),

  timeline: [],
  setTimeline: timeline => set({ timeline }),

  period: null,
  setPeriod: period => set({ period }),

  setDashboardData: data => set(data),

  selectedProjectSlug: DEFAULT_PROJECT_SLUG,
  setSelectedProjectSlug: selectedProjectSlug => set(state => state.selectedProjectSlug === selectedProjectSlug
    ? state
    : { selectedProjectSlug, overviewErrorMessage: "", timelineErrorMessage: "" }),

  timelineMode: "monthly",
  setTimelineMode: timelineMode => set(state => state.timelineMode === timelineMode
    ? state
    : { timelineMode, period: null, overviewErrorMessage: "", timelineErrorMessage: "" }),

  currentState: "idle",
  setCurrentState: currentState => set({ currentState }),

  overviewErrorMessage: "",
  setOverviewErrorMessage: overviewErrorMessage => set({ overviewErrorMessage }),

  timelineErrorMessage: "",
  setTimelineErrorMessage: timelineErrorMessage => set({ timelineErrorMessage }),
}))
