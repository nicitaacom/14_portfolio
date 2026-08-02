import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

export const DEVICE_ID_COOKIE_NAME = "14_did"

const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getEncryptionKey() {
  const hexKey = process.env.DEVICE_ID_ENCRYPTION_KEY

  if (!hexKey || hexKey.length !== 64) {
    throw new Error("DEVICE_ID_ENCRYPTION_KEY must be set to a 32-byte hex string (64 hex chars)")
  }

  return Buffer.from(hexKey, "hex")
}

const encryptionKey = getEncryptionKey()

export function getEndOfDayInTimezone(timezone: string) {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)

  const year = parts.find(part => part.type === "year")?.value
  const month = parts.find(part => part.type === "month")?.value
  const day = parts.find(part => part.type === "day")?.value

  if (!year || !month || !day) return new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const localMidnight = new Date(`${year}-${month}-${day}T00:00:00`)
  const offsetMs = localMidnight.getTime() - now.getTime()
  const endOfDayUtcMs = now.getTime() + offsetMs + 24 * 60 * 60 * 1000 - 1

  return new Date(endOfDayUtcMs)
}

export function encryptDeviceId(deviceId: string) {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv)
  const ciphertext = Buffer.concat([cipher.update(deviceId, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, authTag, ciphertext]).toString("base64url")
}

export function decryptDeviceId(cookieValue: string) {
  try {
    const raw = Buffer.from(cookieValue, "base64url")
    const iv = raw.subarray(0, IV_LENGTH)
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv)
    decipher.setAuthTag(authTag)

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
  } catch {
    return null
  }
}
