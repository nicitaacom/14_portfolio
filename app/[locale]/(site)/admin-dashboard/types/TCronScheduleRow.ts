export interface TCronScheduleRow {
  command: string
  created_at: string
  description: string | null
  id: number
  is_active: boolean
  job_name: string
  last_run_at: string | null
  last_run_status: string | null
  schedule: string
  total_runs: number
  updated_at: string
}
