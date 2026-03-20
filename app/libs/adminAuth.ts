const ADMIN_PASSWORD_COOKIE = "admin-password-ok"

function parseAdminUserIdArr(rawValue: string | undefined) {
  if (!rawValue) return []

  const normalizedValue = rawValue.trim()

  if (normalizedValue.startsWith("[")) {
    try {
      const parsedValue = JSON.parse(normalizedValue)

      if (Array.isArray(parsedValue)) {
        return parsedValue.map(value => String(value).trim()).filter(Boolean)
      }
    } catch (error) {
      console.error("Failed to parse ADMIN_USER_ID_ARR as JSON array:", error)
    }
  }

  return normalizedValue
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
}

export { ADMIN_PASSWORD_COOKIE, parseAdminUserIdArr }
