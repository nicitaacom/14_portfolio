import { THEME_MONTHS } from "../consts/THEME_MONTHS.ts"

import type { SeasonalTheme, SiteTheme, ThemeMonthSchedule } from "@/interfaces/SiteTheme"

export const DEFAULT_THEME: SiteTheme = "default"

export function resolveSeasonalTheme(month: number, schedule: ThemeMonthSchedule = THEME_MONTHS): SiteTheme {
  if (!Number.isInteger(month) || month < 1 || month > 12) return DEFAULT_THEME

  const matchingThemes = (Object.entries(schedule) as [SeasonalTheme, ThemeMonthSchedule[SeasonalTheme]][]).filter(
    ([, months]) => months.some(configuredMonth => configuredMonth === month),
  )

  return matchingThemes.length === 1 ? matchingThemes[0][0] : DEFAULT_THEME
}
