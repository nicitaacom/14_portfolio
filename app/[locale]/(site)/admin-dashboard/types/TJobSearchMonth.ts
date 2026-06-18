export interface TJobSearchMonth {
  /** ISO year-month, e.g. "2026-06" — used as key, for sorting, and for the label */
  month: string
  amountApplies: number
  appointments: number
  applications: number
  /** appointments delta / applications delta × 100, rounded to 2dp. null for the first entry (no prev month). */
  conversionRate: number | null
}
