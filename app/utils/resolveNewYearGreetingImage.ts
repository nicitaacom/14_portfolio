const AVAILABLE_YEARS = [
  2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044,
  2045, 2046, 2047, 2048, 2049, 2059, 2060,
] as const

export function resolveNewYearGreetingImage(year: number): string {
  const closestYear = AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number])
    ? year
    : AVAILABLE_YEARS.reduce((closest, candidate) =>
        Math.abs(candidate - year) < Math.abs(closest - year) ? candidate : closest,
      )

  return `/UI/new-year/years/${closestYear}.jpg`
}
