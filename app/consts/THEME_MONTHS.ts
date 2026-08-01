import type { ThemeMonthSchedule } from "@/interfaces/SiteTheme"

export const THEME_MONTHS = {
  "crazy-mechanics": [6, 7],
  halloween: [11],
  "new-year": [12, 1],
} as const satisfies ThemeMonthSchedule
