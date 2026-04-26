import type { TTrackedProjectGroup } from "@/interfaces/TTrackedProject"

export interface TProjectClicksOverviewDB {
  project_slug: string
  project_name: string
  project_group: TTrackedProjectGroup
  total_clicks: number
  demo_clicks: number
  github_clicks: number
  figma_clicks: number
  youtube_clicks: number
}
