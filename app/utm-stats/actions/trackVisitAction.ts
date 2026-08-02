"use server"

import { isIP } from "net"
import { cookies, headers } from "next/headers"
import { redisKey } from "@/classes/RedisKey/RedisKey"
import { createDeviceId, isValidDeviceId } from "@/libs/deviceId"
import { decryptDeviceId, DEVICE_ID_COOKIE_NAME, encryptDeviceId, getEndOfDayInTimezone } from "@/libs/deviceIdCookie"
import { redis } from "@/libs/redis"
import { getRequestIp } from "@/libs/rateLimitServer"
import supabaseAdmin from "@/libs/supabaseAdmin"

const supabase = supabaseAdmin as any

const extractUTMParams = (searchParams: { [key: string]: string | string[] | undefined } = {}) => ({
  source: Array.isArray(searchParams.utm_source) ? searchParams.utm_source[0] : searchParams.utm_source,
  medium: Array.isArray(searchParams.utm_medium) ? searchParams.utm_medium[0] : searchParams.utm_medium,
  campaign: Array.isArray(searchParams.utm_campaign) ? searchParams.utm_campaign[0] : searchParams.utm_campaign,
})

const FINGERPRINT_TTL_SEC = 600

// A VPS `next start` deployment with no reverse proxy in front of it (or a misconfigured one)
// never sets x-real-ip/x-forwarded-for, so getRequestIp falls back to this literal string for
// every visitor. Trusting it as a Redis lookup key would hand every storage-wiped visitor
// whichever stranger's deviceId last wrote under that shared fake key.
//
// The same goes for the private ranges: everyone behind one router shares 192.168.x.x, so that
// address names a household rather than a visitor. And since both headers arrive from the request
// itself, a hand-written `x-forwarded-for: not-an-ip` would otherwise become a Redis key that any
// number of people could aim at - isIP is what keeps the key an actual address.
const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^f[cd][0-9a-f]{2}:/i,
  /^fe80:/i,
]

function isTrustworthyIp(ip: string) {
  if (ip === "127.0.0.1" || ip === "::1") return false
  if (PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip))) return false
  return isIP(ip) !== 0
}

// computeFingerprint returns a sha256 hex digest and nothing else. Checking the shape here keeps
// the Redis key bounded - the value arrives as a server action argument, so without this a caller
// could send a megabyte of text and have it written as a key.
function isValidFingerprint(fingerprint: string) {
  return /^[0-9a-f]{64}$/.test(fingerprint)
}

// The layers the browser and the request already have on hand - localStorage/cookie first, then
// the IP mapping. Returns null when every one of them misses, which is the only case the
// fingerprint layer below exists for.
async function resolveDeviceIdFromStorageAndIp(clientDeviceId: string | null, ip: string) {
  // isValidDeviceId on every one of these, not only the localStorage value - see its own comment.
  if (isValidDeviceId(clientDeviceId)) return clientDeviceId

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value
  const decryptedCookieDeviceId = cookieValue ? decryptDeviceId(cookieValue) : null
  if (isValidDeviceId(decryptedCookieDeviceId)) return decryptedCookieDeviceId

  if (isTrustworthyIp(ip)) {
    const deviceIdFromIp = await redis.get<string>(redisKey.getDeviceIdByIpKey(ip))
    if (isValidDeviceId(deviceIdFromIp)) return deviceIdFromIp
  }

  return null
}

// Fingerprint match is a probability, not proof - a different browser on a similar machine
// tells the server nothing about whether it's actually the same person. It lives in Redis alone
// on a short TTL (see syncDeviceIdLayers) instead of the day-long expiry the IP/cookie layers
// use, so a coincidental match can only bridge one short session, not silently claim someone
// else's deviceId for the rest of the day. An empty fingerprint means the browser had nothing to
// offer, so there is nothing to look up and a new deviceId is the answer.
async function resolveDeviceIdFromFingerprint(fingerprint: string) {
  if (isValidFingerprint(fingerprint)) {
    const deviceIdFromFingerprint = await redis.get<string>(redisKey.getDeviceIdByFingerprintKey(fingerprint))
    if (isValidDeviceId(deviceIdFromFingerprint)) return deviceIdFromFingerprint
  }

  return createDeviceId()
}

// Two people behind the same NAT/CGNAT/office wifi can, in principle, receive the same deviceId
// via this IP-fallback lookup if one clears storage right after the other visited from that
// shared IP - a best-effort recovery heuristic, not a guarantee. Same caveat applies to the
// fingerprint lookup above for two people on genuinely identical hardware within the same
// 10-minute window.
async function syncDeviceIdLayers(deviceId: string, ip: string, timezone: string, fingerprint: string | null) {
  const endOfDay = getEndOfDayInTimezone(timezone)

  if (isTrustworthyIp(ip)) {
    await redis.set(redisKey.getDeviceIdByIpKey(ip), deviceId, { exat: Math.floor(endOfDay.getTime() / 1000) })
  }

  if (fingerprint && isValidFingerprint(fingerprint)) {
    await redis.set(redisKey.getDeviceIdByFingerprintKey(fingerprint), deviceId, { ex: FINGERPRINT_TTL_SEC })
  }

  const cookieStore = await cookies()
  const existingCookieValue = cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value
  const existingDeviceId = existingCookieValue ? decryptDeviceId(existingCookieValue) : null

  if (existingDeviceId !== deviceId) {
    cookieStore.set(DEVICE_ID_COOKIE_NAME, encryptDeviceId(deviceId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: endOfDay,
    })
  }
}

// Written out rather than inferred so the two shapes stay separate - an inferred union gives the
// needsFingerprint shape an optional `deviceId?: undefined`, and `"deviceId" in result` then tells
// the client nothing about which shape it actually got.
type TrackVisitResult = { needsFingerprint: true } | { deviceId: string }

export async function trackVisitAction(
  clientDeviceId: string | null,
  searchParams: { [key: string]: string | string[] | undefined } = {},
  currentUrl = "/",
  timezone = "UTC",
  // null means the browser has not computed one yet, "" means it tried and had nothing to offer -
  // the difference is what stops this from asking for a fingerprint the browser already failed to
  // produce and looping forever.
  fingerprint: string | null = null,
): Promise<TrackVisitResult> {
  const requestHeaders = await headers()
  const ip = getRequestIp(requestHeaders)

  const deviceIdFromStorageAndIp = await resolveDeviceIdFromStorageAndIp(clientDeviceId, ip)
  if (!deviceIdFromStorageAndIp && fingerprint === null) return { needsFingerprint: true as const }

  const deviceId = deviceIdFromStorageAndIp ?? (await resolveDeviceIdFromFingerprint(fingerprint ?? ""))
  await syncDeviceIdLayers(deviceId, ip, timezone, fingerprint)

  const utmParams = extractUTMParams(searchParams)
  const hasUTMParams = Object.values(utmParams).some(param => param !== undefined)

  const today = new Date().toISOString().split("T")[0]
  const { data: recentVisit } = await supabase
    .from("utm_stats")
    .select("id, created_at")
    .eq("user_id", deviceId)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lte("created_at", `${today}T23:59:59.999Z`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recentVisit) return { deviceId }

  const finalParams = hasUTMParams
    ? utmParams
    : {
        source: "organic",
        medium: "direct",
        campaign: undefined,
      }

  const userAgent = requestHeaders.get("user-agent") ?? "unknown"
  const response = await insertDBUTMVisitAction(deviceId, finalParams, userAgent, currentUrl)
  if (typeof response === "string") console.log(52, "insert failed - ", response)

  return { deviceId }
}

interface UTMParams {
  source?: string
  medium?: string
  campaign?: string
}

async function insertDBUTMVisitAction(userId: string, utmParams: UTMParams, userAgent: string | null, currentUrl: string) {
  try {
    const { error } = await supabase.from("utm_stats").insert({
      user_id: userId,
      source: utmParams.source,
      medium: utmParams.medium,
      campaign: utmParams.campaign,
      url: currentUrl,
      user_agent: userAgent,
    })
    if (error) throw Error(error.message)
  } catch (error) {
    return `Error tracking UTM visit: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}
