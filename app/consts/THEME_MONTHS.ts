import type { ThemeMonthSchedule } from "@/interfaces/SiteTheme"

export const THEME_MONTHS = {
  "crazy-mechanics": [6, 7],
  halloween: [10],
  "new-year": [11, 1],
} as const satisfies ThemeMonthSchedule
