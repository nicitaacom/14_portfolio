export type TTrackedProjectGroup = "work" | "projects" | "clones"

export interface TTrackedProject {
  slug: string
  name: string
  shortName: string
  group: TTrackedProjectGroup
}
