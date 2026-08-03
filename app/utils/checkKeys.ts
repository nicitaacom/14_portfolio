import { createHmac } from "node:crypto"

import type { TKeyCheckReport } from "@/interfaces/TKeyCheckReport"
import type { TKeyProbe } from "@/interfaces/TKeyProbe"

/** Skip the pre-push run when the last green run is newer than this. */
export const PUSH_CHECK_EVERY_DAYS = 3

/** The webhook answers {"skipped":true} when the last prod run is newer than this. */
export const PROD_CHECK_EVERY_DAYS = 7

/** Remind about an already-reported key only this often. A newly broken key always goes out at once. */
export const REALERT_AFTER_DAYS = 28

/**
 * 20s, not 8s. A revoked key answers 401 in under a second, so this number never decides whether a key
 * is good - it only decides how long a slow network is given before the run gives up on a name.
 */
const PROBE_TIMEOUT_MS = 20000
const PROBES_IN_FLIGHT = 8
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function readKey(name: string): string {
  return (process.env[name] ?? "").trim()
}

function describeStatus(status: number, body: string): string {
  const trimmedBody = body.replace(/\s+/g, " ").trim().slice(0, 120)

  return status === 0 ? trimmedBody || "no answer" : `${status} ${trimmedBody}`
}

async function requestKey(url: string, init?: RequestInit): Promise<{ status: number; body: string }> {
  const startedAt = Date.now()
  try {
    const fetchResp = await fetch(url, { ...init, signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) })

    return { status: fetchResp.status, body: (await fetchResp.text()).slice(0, 400) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const elapsedMs = Date.now() - startedAt
    // "The operation was aborted due to timeout" on its own hides which host was slow and by how much
    const isTimeout = message.includes("abort") || message.includes("timeout")

    return { status: 0, body: isTimeout ? `no answer in ${elapsedMs}ms from ${new URL(url).host}` : message }
  }
}

/* ── shape probes ─────────────────────────────────────────────────────────────────────────────── */

function checkByteLength(value: string, wantedBytes: number): string | null {
  const decodedLength = /^[0-9a-fA-F]+$/.test(value) ? value.length / 2 : Buffer.from(value, "base64").length

  return decodedLength === wantedBytes ? null : `decodes to ${decodedLength} bytes, wanted ${wantedBytes}`
}

function checkUrl(value: string): string | null {
  try {
    return new URL(value).protocol.startsWith("http") ? null : "is not an http url"
  } catch {
    return "is not a url"
  }
}

function checkEmail(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "is not an email address"
}

function checkUuidList(value: string): string | null {
  const ids = value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(id => id.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)
  if (!ids.length) return "holds no id"

  const broken = ids.map((id, index) => (UUID_PATTERN.test(id) ? null : `[${index}] is not a uuid`)).filter(Boolean)

  return broken.length ? broken.join(", ") : null
}

/* ── live probes ──────────────────────────────────────────────────────────────────────────────── */

/**
 * `/auth/v1/settings`, not `/rest/v1/`. PostgREST's root answers an anon key with
 * `401 Only the service_role API key can be used for this endpoint`, so the root reports a perfectly
 * good anon key as revoked. The auth settings are what the browser reads with this key anyway.
 */
async function checkSupabaseAnonKey(anonKey: string): Promise<string | null> {
  const supabaseUrl = readKey("NEXT_PUBLIC_SUPABASE_URL")
  if (!supabaseUrl) return "needs NEXT_PUBLIC_SUPABASE_URL"

  const { status, body } = await requestKey(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: anonKey } })

  return status === 200 ? null : describeStatus(status, body)
}

async function checkSupabaseServiceRoleKey(serviceRoleKey: string): Promise<string | null> {
  const supabaseUrl = readKey("NEXT_PUBLIC_SUPABASE_URL")
  if (!supabaseUrl) return "needs NEXT_PUBLIC_SUPABASE_URL"

  const { status, body } = await requestKey(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  })

  return status === 200 ? null : describeStatus(status, body)
}

/**
 * Only that the host is up and serving Supabase. Any HTTP answer proves that, so a revoked anon key
 * fails on its own line instead of reporting the URL as broken too.
 */
async function checkSupabaseUrl(supabaseUrl: string): Promise<string | null> {
  const shapeReason = checkUrl(supabaseUrl)
  if (shapeReason) return shapeReason

  const { status, body } = await requestKey(`${supabaseUrl}/auth/v1/settings`)

  return status === 0 ? describeStatus(status, body) : null
}

async function checkUpstashRestToken(restToken: string): Promise<string | null> {
  const restUrl = readKey("UPSTASH_REDIS_REST_URL")
  if (!restUrl) return "needs UPSTASH_REDIS_REST_URL"

  const { status, body } = await requestKey(`${restUrl}/ping`, { headers: { Authorization: `Bearer ${restToken}` } })
  if (status !== 200) return describeStatus(status, body)

  return body.includes("PONG") ? null : `answered ${body.slice(0, 60)} instead of PONG`
}

async function checkTelegramBotToken(botToken: string): Promise<string | null> {
  const { status, body } = await requestKey(`https://api.telegram.org/bot${botToken}/getMe`)

  return status === 200 ? null : describeStatus(status, body)
}

/** Read-only, same as getMe - it also proves the bot is still a member of that chat. */
async function checkTelegramChatId(chatId: string): Promise<string | null> {
  const botToken = readKey("TELEGRAM_BOT_TOKEN")
  if (!botToken) return "needs TELEGRAM_BOT_TOKEN"

  const { status, body } = await requestKey(
    `https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(chatId)}`,
  )

  return status === 200 ? null : describeStatus(status, body)
}

async function checkResendSecret(resendSecret: string): Promise<string | null> {
  const { status, body } = await requestKey("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${resendSecret}` },
  })

  return status === 200 ? null : describeStatus(status, body)
}

/**
 * Proves the key both decodes to 32 bytes and actually signs, which is what `app/libs/deviceId.ts`
 * needs from it. A value of the right length that node refuses as an HMAC key still fails here.
 */
function checkDeviceIdEncryptionKey(value: string): string | null {
  const lengthReason = checkByteLength(value, 32)
  if (lengthReason) return lengthReason

  try {
    createHmac("sha256", value).update("probe").digest("hex")

    return null
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

/* ── the registry ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Every name declared in `env.d.ts`. `tests/keys.test.mjs` asserts that this list holds the same names
 * as `env.d.ts` and `.env.local.example`, so a name added to one of those files and forgotten here
 * fails the next push instead of going unchecked forever.
 */
export const KEY_PROBES: TKeyProbe[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", tier: "live", check: checkSupabaseUrl },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", tier: "live", check: checkSupabaseAnonKey },
  { name: "SUPABASE_SERVICE_ROLE_KEY", tier: "live", check: checkSupabaseServiceRoleKey },

  { name: "TELEGRAM_BOT_TOKEN", tier: "live", check: checkTelegramBotToken },
  { name: "TELEGRAM_CHAT_ID", tier: "live", check: checkTelegramChatId },

  { name: "UPSTASH_REDIS_REST_URL", tier: "shape", check: checkUrl },
  { name: "UPSTASH_REDIS_REST_TOKEN", tier: "live", check: checkUpstashRestToken },

  { name: "DEVICE_ID_ENCRYPTION_KEY", tier: "shape", check: checkDeviceIdEncryptionKey },

  { name: "ADMIN_USER_ID_ARR", tier: "shape", check: checkUuidList },
  { name: "ADMIN_PASSWORD", tier: "skip" },

  { name: "RESEND_SECRET", tier: "live", check: checkResendSecret },
  { name: "NEXT_PUBLIC_SUPPORT_NOTIFICATION_EMAIL", tier: "shape", check: checkEmail },
  { name: "CRON_SECRET", tier: "skip" },
]

/* ── the runner ───────────────────────────────────────────────────────────────────────────────── */

/**
 * Presence runs first for every name, whatever its tier - `undefined` or an empty value fails right
 * there and the probe is not attempted. That is what catches a name declared in `.env.local.example`
 * and never set on Vercel.
 */
export async function runOneKeyProbe(probe: TKeyProbe): Promise<{ name: string; reason: string } | null> {
  const value = readKey(probe.name)
  if (!value) {
    if (probe.optionalWhen && readKey(probe.optionalWhen)) return null

    const alsoEmpty = probe.optionalWhen ? ` and so is ${probe.optionalWhen}, the app reads one of the two` : ""

    return { name: probe.name, reason: `missing - declared, value is empty${alsoEmpty}` }
  }
  if (!probe.check) return null

  // The last line of defence. Every probe already limits its own request, so reaching this means one
  // of them found a way to wait forever, and the run still ends with a named reason instead of hanging.
  const reason = await Promise.race([
    Promise.resolve(probe.check(value)),
    new Promise<string>(resolve => {
      setTimeout(() => resolve(`no answer within ${(PROBE_TIMEOUT_MS + 2000) / 1000}s`), PROBE_TIMEOUT_MS + 2000).unref()
    }),
  ])

  return reason ? { name: probe.name, reason } : null
}

/**
 * `onProbeDone` runs after each name finishes so the caller prints as it goes. Without it the whole
 * run is seconds of silence and looks stopped.
 *
 * The probes run through a queue rather than fixed groups: one slow name would otherwise hold back
 * the seven names next to it.
 */
export async function runKeyChecks(
  probes: TKeyProbe[] = KEY_PROBES,
  onProbeDone?: (name: string, reason: string | null, doneCount: number, total: number, elapsedMs: number) => void,
): Promise<TKeyCheckReport> {
  const failures: { name: string; reason: string }[] = []
  let nextIndex = 0
  let doneCount = 0

  const runFromQueue = async () => {
    while (nextIndex < probes.length) {
      const probe = probes[nextIndex++]
      const startedAt = Date.now()
      const failure = await runOneKeyProbe(probe)
      doneCount += 1
      if (failure) failures.push(failure)
      onProbeDone?.(probe.name, failure?.reason ?? null, doneCount, probes.length, Date.now() - startedAt)
    }
  }

  await Promise.all(Array.from({ length: Math.min(PROBES_IN_FLIGHT, probes.length) }, () => runFromQueue()))
  failures.sort(
    (first, second) =>
      probes.findIndex(probe => probe.name === first.name) - probes.findIndex(probe => probe.name === second.name),
  )

  return {
    ok: failures.length === 0,
    failures,
    liveCount: probes.filter(probe => probe.tier === "live").length,
    shapeCount: probes.filter(probe => probe.tier === "shape").length,
    skipCount: probes.filter(probe => probe.tier === "skip").length,
    ranAt: new Date().toISOString(),
  }
}

export function daysSince(isoTimestamp: string | null | undefined): number | null {
  if (!isoTimestamp) return null
  const happenedAt = Date.parse(isoTimestamp)

  return Number.isNaN(happenedAt) ? null : (Date.now() - happenedAt) / (24 * 60 * 60 * 1000)
}

/**
 * Silence is the healthy state, so this decides when breaking it is worth it:
 *
 *   a name that was not broken last time -> send now, that is news
 *   the very same names as last time     -> stay quiet until REALERT_AFTER_DAYS has passed
 *
 * Without the second rule one revoked key sends a message every single week until it is fixed, and a
 * report you have already read teaches you to ignore the next one.
 */
export function shouldSendKeyAlert(
  failingNames: string[],
  lastAlert: { names: string[]; sentAt: string } | null,
): boolean {
  if (!lastAlert) return true

  const isSameSet =
    lastAlert.names.length === failingNames.length && failingNames.every(name => lastAlert.names.includes(name))
  if (!isSameSet) return true

  const daysSinceAlert = daysSince(lastAlert.sentAt)

  return daysSinceAlert === null || daysSinceAlert >= REALERT_AFTER_DAYS
}

/** One streaming line, shared by `pnpm test:keys` and the pre-push run so both read the same. */
export function formatKeyProgressLine(
  name: string,
  reason: string | null,
  doneCount: number,
  total: number,
  elapsedMs: number,
): string {
  const counter = `${String(doneCount).padStart(2)}/${total}`

  return `  ${counter} ${String(elapsedMs).padStart(6)}ms  ${reason ? "✘" : "✔"} ${name}${reason ? ` — ${reason}` : ""}\n`
}

/** The message body the Telegram alert and the email both send. */
export function formatKeyCheckReport(projectName: string, report: TKeyCheckReport): string {
  const namesCount = report.liveCount + report.shapeCount + report.skipCount
  if (report.ok) return `${projectName} — all ${namesCount} names OK · ${report.liveCount} proved by a request`

  return [
    `${projectName} — ${report.failures.length} key${report.failures.length === 1 ? "" : "s"} need you`,
    "",
    ...report.failures.map(failure => `✘ ${failure.name} — ${failure.reason}`),
    "",
    `✔ ${namesCount - report.failures.length} other names OK · ${report.shapeCount} shape-checked`,
  ].join("\n")
}
