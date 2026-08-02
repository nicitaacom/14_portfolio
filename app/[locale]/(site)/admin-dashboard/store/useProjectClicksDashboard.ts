import { trackedProjects } from "@/data/trackedProjects"
import { create } from "zustand"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"

interface ProjectClicksDashboardStore {
  overview: TProjectClicksOverviewDB[]
  setOverview: (overview: TProjectClicksOverviewDB[]) => void

  timeline: TProjectClicksTimelineDB[]
  setTimeline: (timeline: TProjectClicksTimelineDB[]) => void

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

  selectedProjectSlug: DEFAULT_PROJECT_SLUG,
  setSelectedProjectSlug: selectedProjectSlug => set({ selectedProjectSlug }),

  timelineMode: "monthly",
  setTimelineMode: timelineMode => set({ timelineMode }),

  currentState: "idle",
  setCurrentState: currentState => set({ currentState }),

  overviewErrorMessage: "",
  setOverviewErrorMessage: overviewErrorMessage => set({ overviewErrorMessage }),

  timelineErrorMessage: "",
  setTimelineErrorMessage: timelineErrorMessage => set({ timelineErrorMessage }),
}))
