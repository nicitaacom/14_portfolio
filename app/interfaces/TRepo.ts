import type { TTrackedProject, TTrackedProjectGroup } from "./TTrackedProject"

export type TRepoGroup = TTrackedProjectGroup | "hidden"

export interface TRepo {
  id: number
  description: string
  url?: string
  stack?: string
  slug?: string
  name?: string
  shortName?: string
  group?: TRepoGroup
}

/** A repo that owns a project card - slug/name/shortName/group are guaranteed present. */
export type TTrackedRepo = TRepo & TTrackedProject & { stack: string }

/** A repo the navbar ticker can link to. */
export type TPublicRepo = TRepo & { url: string }
