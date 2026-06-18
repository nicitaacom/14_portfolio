const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
})

export function formatDateTime(value: string | null, emptyValue = "") {
  if (!value) return emptyValue
  return dateTimeFormatter.format(new Date(value))
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}
