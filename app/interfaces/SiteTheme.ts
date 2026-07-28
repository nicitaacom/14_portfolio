export type SiteTheme = "default" | "crazy-mechanics" | "halloween" | "new-year"

export type SeasonalTheme = Exclude<SiteTheme, "default">

export type CalendarMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type ThemeMonthSchedule = Readonly<Record<SeasonalTheme, readonly CalendarMonth[]>>
