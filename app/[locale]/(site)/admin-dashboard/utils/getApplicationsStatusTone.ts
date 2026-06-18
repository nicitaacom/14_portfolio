import type { TApplicationsTone } from "../types/TApplicationsTone"

/** Maps a month's application count to a status tone. <100 danger · 100–149 warning · >=150 success. */
export function getApplicationsStatusTone(applications: number): TApplicationsTone {
  if (applications < 100) return "danger"
  if (applications < 150) return "warning"
  return "success"
}
