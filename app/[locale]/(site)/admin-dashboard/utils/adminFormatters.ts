function intlLocale(locale: string) {
  return locale === "ua" ? "uk" : locale
}

export function formatDateTime(value: string | null, emptyValue = "", locale = "en-GB") {
  if (!value || !Number.isFinite(Date.parse(value))) return emptyValue
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short",
  }).format(new Date(value))
}

export function formatDate(value: string, locale = "en-GB") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric", month: "short", day: "2-digit", timeZone: "UTC",
  }).format(new Date(value))
}
