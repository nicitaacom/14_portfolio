import type { ThemeMonthSchedule } from "@/interfaces/SiteTheme"

export const THEME_MONTHS = {
  // "crazy-mechanics": [6, 7],
  "crazy-mechanics": [10],
  halloween: [7],
  "new-year": [12, 1],
} as const satisfies ThemeMonthSchedule
