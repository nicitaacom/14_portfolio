import { applications } from "@/data/hours-and-applications"
import type { TJobSearchMonth } from "../types/TJobSearchMonth"

type SourceEntry = { appointments: number; amount_applies: number }

function buildJobSearchStats(): { data: TJobSearchMonth[]; error: string | null } {
  const entries = (Object.entries(applications) as [string, SourceEntry][]).sort(([a], [b]) => {
    const [aM, aY] = a.split(".")
    const [bM, bY] = b.split(".")
    return aY !== bY ? parseInt(aY, 10) - parseInt(bY, 10) : parseInt(aM, 10) - parseInt(bM, 10)
  })

  for (let i = 0; i < entries.length; i++) {
    const [key] = entries[i]
    const [monthStr, yearStr] = key.split(".")
    const month = parseInt(monthStr, 10)
    const year = parseInt(yearStr, 10)
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return {
        data: [],
        error: `Data error: "${key}" is not a valid month key. Use MM.YYYY format with month 01–12 (e.g. "06.2026").`,
      }
    }
  }

  for (let i = 1; i < entries.length; i++) {
    const [prevKey, prevVal] = entries[i - 1]
    const [currKey, currVal] = entries[i]

    if (currVal.amount_applies < prevVal.amount_applies) {
      return {
        data: [],
        error: `Data error: amount_applies decreased from ${prevKey} (${prevVal.amount_applies}) to ${currKey} (${currVal.amount_applies}). Cumulative totals can only increase.`,
      }
    }

    if (currVal.appointments < prevVal.appointments) {
      return {
        data: [],
        error: `Data error: appointments decreased from ${prevKey} (${prevVal.appointments}) to ${currKey} (${currVal.appointments}). Cumulative totals can only increase.`,
      }
    }
  }

  const data = entries.map(([key, value], index) => {
    const [month, year] = key.split(".")
    const prev = index > 0 ? entries[index - 1][1] : null
    const applications = prev ? value.amount_applies - prev.amount_applies : value.amount_applies
    const apptDelta = prev ? value.appointments - prev.appointments : null
    const conversionRate =
      apptDelta !== null && applications > 0
        ? Math.round((apptDelta / applications) * 10000) / 100
        : null
    return {
      month: `${year}-${month.padStart(2, "0")}`,
      amountApplies: value.amount_applies,
      appointments: value.appointments,
      applications,
      conversionRate,
    }
  })

  return { data, error: null }
}

export const { data: jobSearchStats, error: jobSearchStatsError } = buildJobSearchStats()
