export const LOCALES = ["en", "ru", "ua", "de", "pl"] as const

export type TLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: TLocale = "en"

export const localeLoaders = {
  en: () => import("./en"),
  ru: () => import("./ru"),
  ua: () => import("./ua"),
  de: () => import("./de"),
  pl: () => import("./pl"),
} as const
