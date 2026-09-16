export interface TJobSearchMonth {
  /** ISO year-month, e.g. "2026-06" — used as key, for sorting, and for the label */
  month: string
  totalApplications: number
  totalInterviews: number
  /** null for the first snapshot: its cumulative total is not a monthly result. */
  applicationsAdded: number | null
  interviewsAdded: number | null
  /** Interviews added / applications added × 100. null for baseline or no applications. */
  conversionRate: number | null
}
