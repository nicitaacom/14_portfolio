import { DEFAULT_LOCALE, LOCALES, TLocale } from "./config"

export const NEXT_LOCALE_COOKIE_NAME = "Next-Locale"

export function isLocale(value: string): value is TLocale {
  return LOCALES.includes(value as TLocale)
}

export function stripLocalePrefix(pathname: string) {
  const normalizedPathname = pathname || "/"
  const matchedLocale = LOCALES.find(locale => normalizedPathname === `/${locale}` || normalizedPathname.startsWith(`/${locale}/`))

  if (!matchedLocale) return normalizedPathname

  const pathWithoutLocale = normalizedPathname.slice(matchedLocale.length + 1)

  return pathWithoutLocale || "/"
}

export function localizePath(pathname: string, locale: TLocale) {
  const normalizedPathname = stripLocalePrefix(pathname || "/")

  if (locale === DEFAULT_LOCALE) return normalizedPathname
  if (normalizedPathname === "/") return `/${locale}`

  return `/${locale}${normalizedPathname}`
}

export function localizeHref(href: string, locale: TLocale) {
  if (!href.startsWith("/")) return href

  const [pathname, suffix = ""] = href.split(/(?=[?#])/)

  return `${localizePath(pathname || "/", locale)}${suffix}`
}

export function getLocaleFromPathname(pathname: string) {
  const matchedLocale = LOCALES.find(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))

  return matchedLocale ?? DEFAULT_LOCALE
}

export function getLocalizedPathname(pathname: string, locale: TLocale, search = "") {
  const localizedPath = localizePath(pathname, locale)

  return `${localizedPath}${search}`
}
