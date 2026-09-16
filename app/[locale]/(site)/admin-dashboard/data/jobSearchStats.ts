import { applications } from "@/data/hours-and-applications"
import type { TJobSearchMonth } from "../types/TJobSearchMonth"

export type JobSearchSourceEntry = { interviews: number; amount_applies: number }

export function buildJobSearchStats(
  source: Record<string, JobSearchSourceEntry>,
): { data: TJobSearchMonth[]; error: string | null } {
  const entries = Object.entries(source).map(([key, value]) => {
    const match = /^(0[1-9]|1[0-2])\.(\d{4})$/.exec(key)
    return { month: match ? `${match[2]}-${match[1]}` : null, value }
  })

  if (entries.some(entry => !entry.month)) return { data: [], error: "invalid-month" }
  if (entries.some(({ value }) =>
    !Number.isSafeInteger(value.amount_applies) || value.amount_applies < 0 ||
    !Number.isSafeInteger(value.interviews) || value.interviews < 0,
  )) return { data: [], error: "invalid-count" }

  entries.sort((a, b) => a.month!.localeCompare(b.month!))
  const data: TJobSearchMonth[] = []

  for (const [index, entry] of entries.entries()) {
    const previous = index > 0 ? entries[index - 1] : null
    const applicationsAdded = previous ? entry.value.amount_applies - previous.value.amount_applies : null
    const interviewsAdded = previous ? entry.value.interviews - previous.value.interviews : null

    if ((applicationsAdded !== null && applicationsAdded < 0) || (interviewsAdded !== null && interviewsAdded < 0)) {
      return { data: [], error: "decreasing-total" }
    }

    // A missing snapshot cannot establish an individual month's result.
    const [year, month] = entry.month!.split("-").map(Number)
    const [previousYear, previousMonth] = previous?.month?.split("-").map(Number) ?? []
    const hasMonthlyBaseline = Boolean(previous) && year * 12 + month - (previousYear * 12 + previousMonth) === 1

    data.push({
      month: entry.month!,
      totalApplications: entry.value.amount_applies,
      totalInterviews: entry.value.interviews,
      applicationsAdded: hasMonthlyBaseline ? applicationsAdded : null,
      interviewsAdded: hasMonthlyBaseline ? interviewsAdded : null,
      conversionRate: hasMonthlyBaseline && applicationsAdded !== null && applicationsAdded > 0 && interviewsAdded !== null
        ? Math.round(interviewsAdded / applicationsAdded * 10000) / 100
        : null,
    })
  }

  return { data, error: null }
}

export const { data: jobSearchStats, error: jobSearchStatsError } = buildJobSearchStats(applications)
