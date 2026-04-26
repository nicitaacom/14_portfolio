import { trackedProjects } from "@/data/trackedProjects"
import { create } from "zustand"
import type { TProjectClicksOverviewDB } from "../types/TProjectClicksOverviewDB"
import type { TProjectClicksTimelineDB } from "../types/TProjectClicksTimelineDB"
import type { TProjectClicksTimelineMode } from "../types/TProjectClicksTimelineMode"

interface ProjectClicksDashboardStore {
  overview: TProjectClicksOverviewDB[]
  timeline: TProjectClicksTimelineDB[]
  selectedProjectSlug: string
  timelineMode: TProjectClicksTimelineMode
  currentState: "idle" | "fetching" | "up to date"
  overviewErrorMessage: string
  timelineErrorMessage: string
  setOverview: (overview: TProjectClicksOverviewDB[]) => void
  setTimeline: (timeline: TProjectClicksTimelineDB[]) => void
  setSelectedProjectSlug: (selectedProjectSlug: string) => void
  setTimelineMode: (timelineMode: TProjectClicksTimelineMode) => void
  setCurrentState: (currentState: "idle" | "fetching" | "up to date") => void
  setOverviewErrorMessage: (overviewErrorMessage: string) => void
  setTimelineErrorMessage: (timelineErrorMessage: string) => void
}

const DEFAULT_PROJECT_SLUG = trackedProjects[0]?.slug ?? "project-riz-admin-dashboard"

export const useProjectClicksDashboard = create<ProjectClicksDashboardStore>()(set => ({
  overview: [],
  timeline: [],
  selectedProjectSlug: DEFAULT_PROJECT_SLUG,
  timelineMode: "monthly",
  currentState: "idle",
  overviewErrorMessage: "",
  timelineErrorMessage: "",
  setOverview: overview => set({ overview }),
  setTimeline: timeline => set({ timeline }),
  setSelectedProjectSlug: selectedProjectSlug => set({ selectedProjectSlug }),
  setTimelineMode: timelineMode => set({ timelineMode }),
  setCurrentState: currentState => set({ currentState }),
  setOverviewErrorMessage: overviewErrorMessage => set({ overviewErrorMessage }),
  setTimelineErrorMessage: timelineErrorMessage => set({ timelineErrorMessage }),
}))
