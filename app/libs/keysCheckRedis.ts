import type { TKeyCheckReport } from "@/interfaces/TKeyCheckReport"
import { redis } from "@/libs/redis"

/**
 * The three things the weekly key check remembers between runs:
 *
 *   keys-check:14:last-run     -> ISO timestamp, so the webhook skips a run inside PROD_CHECK_EVERY_DAYS
 *   keys-check:14:last-report  -> the whole report, so you can read the last answer without a run
 *   keys-check:14:last-alert   -> which names were reported and when, so the same failure stays quiet
 *
 * `14` is in every key because projects 14/19/23/28/29 share one Upstash database. Without the number,
 * 23_store's weekly run would overwrite this project's timestamp and each would report the other's
 * state as its own.
 *
 * No expiry on any of them. A timestamp that quietly disappears would restart the every-7-days clock
 * and hide a cron that stopped firing, which is the one thing these keys exist to make visible.
 */
const PROJECT_KEY_PREFIX = "keys-check:14"

export type TKeysCheckAlert = {
  names: string[]
  sentAt: string
}

export async function getRedisKeysCheckLastRun(): Promise<string | null> {
  return redis.get<string>(`${PROJECT_KEY_PREFIX}:last-run`)
}

export async function setRedisKeysCheckLastRun(ranAt: string): Promise<void> {
  await redis.set(`${PROJECT_KEY_PREFIX}:last-run`, ranAt)
}

export async function setRedisKeysCheckLastReport(report: TKeyCheckReport): Promise<void> {
  await redis.set(`${PROJECT_KEY_PREFIX}:last-report`, report)
}

export async function getRedisKeysCheckLastAlert(): Promise<TKeysCheckAlert | null> {
  return redis.get<TKeysCheckAlert>(`${PROJECT_KEY_PREFIX}:last-alert`)
}

export async function setRedisKeysCheckLastAlert(alert: TKeysCheckAlert): Promise<void> {
  await redis.set(`${PROJECT_KEY_PREFIX}:last-alert`, alert)
}
