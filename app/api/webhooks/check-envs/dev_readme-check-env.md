# Keys check — are the API keys still valid?

## 0. Why this exists

A third party revokes an API key and nothing tells you. Supabase rotates a service role key, an
Upstash database is recreated, a Telegram bot is removed from the chat, someone edits a value on
Vercel and drops a character.

This project goes weeks without a push, so a push-triggered check alone would never run. That is why
there are two:

- **on push** — every 3 days, against the local dotenv file
- **weekly in prod** — against the real Vercel values, because those are a separate copy that drifts

Same design as `23_store`. See its
[dev_readme-check-env.md](../../../../../23_store/app/api/webhooks/check-envs/dev_readme-check-env.md)
for the fuller write-up; this file records what is different here.

## 1. Where data lives

```
.git/keys-check-stamp                  ISO timestamp of the last green push-time run
                                       inside .git, so no .gitignore line and no fresh clone
                                       inherits a stale one

Upstash (shared by 14/19/23/28/29)
  keys-check:14:last-run               ISO timestamp — the PROD_CHECK_EVERY_DAYS gate reads this
  keys-check:14:last-report            the whole last report, readable without a run
  keys-check:14:last-alert             { names, sentAt } — what was already reported

app/utils/checkKeys.ts
  PUSH_CHECK_EVERY_DAYS = 3            the pre-push gate
  PROD_CHECK_EVERY_DAYS = 7            the webhook gate
  REALERT_AFTER_DAYS   = 28            how often an unfixed name is repeated
```

`14` is in every Redis key because five projects share one Upstash database — the same reason
`utm:14:*` has it. Without the number, `23_store`'s weekly run would overwrite this project's
timestamp and each would report the other's state as its own.

### Types

```ts
// app/interfaces/TKeyProbe.ts
type TKeyProbe = {
  name: string
  tier: "live" | "shape" | "skip"
  optionalWhen?: string
  check?: (value: string) => Promise<string | null> | string | null
}

// app/interfaces/TKeyCheckReport.ts
type TKeyCheckReport = {
  ok: boolean
  failures: { name: string; reason: string }[]
  liveCount: number
  shapeCount: number
  skipCount: number
  ranAt: string
}
```

### Files

| File | Holds |
| --- | --- |
| [app/utils/checkKeys.ts](../../../utils/checkKeys.ts) | the 3 CAPS consts, the registry of 14 names, every probe, `runKeyChecks()` |
| [app/utils/sendTelegramMessage.ts](../../../utils/sendTelegramMessage.ts) | one Telegram send, used by this route and `sendTelegramMessageAction` |
| [app/libs/keysCheckRedis.ts](../../../libs/keysCheckRedis.ts) | the three Upstash keys, on the shared client from `app/libs/redis.ts` |
| [route.ts](route.ts) | the webhook Supabase pg_cron sends a request to |
| [tests/keys.test.mjs](../../../../tests/keys.test.mjs) | `pnpm test:keys` — one test per name + 3 drift tests |
| [tests/checkKeys.test.mjs](../../../../tests/checkKeys.test.mjs) | `pnpm test` — the pure logic, no network |
| [tests/pushKeyCheck.mjs](../../../../tests/pushKeyCheck.mjs) | what `.githooks/pre-push` runs |
| [tests/alias-hook.mjs](../../../../tests/alias-hook.mjs) | teaches node the `@/` alias that tsconfig gives TypeScript |

### Terminology

**Presence runs first, for every name, whatever its tier.** An absent or empty value fails right
there and the probe below is never attempted.

| Tier | Runs after presence passes | Fails on |
| --- | --- | --- |
| **live** | A real request to the service | a 401 or 403 answer |
| **shape** | No service to ask, so the value's own format is read | a wrong format |
| **skip** | Nothing beyond presence | nothing |

### The 14 names

| Name | Tier | How it is proved |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | live | the host answers at all |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | live | `GET /auth/v1/settings` → 200 |
| `SUPABASE_SERVICE_ROLE_KEY` | live | `GET /auth/v1/admin/users` → 200 |
| `TELEGRAM_BOT_TOKEN` | live | `getMe` → 200 |
| `TELEGRAM_CHAT_ID` | live | `getChat` → 200, so it also proves the bot is still in the chat |
| `UPSTASH_REDIS_REST_URL` | shape | parses as an http url |
| `UPSTASH_REDIS_REST_TOKEN` | live | `GET /ping` → `PONG` |
| `UPSTASH_REDIS_URL` | live | a TLS socket, `AUTH` then `PING` → `+PONG` |
| `DEVICE_ID_ENCRYPTION_KEY` | shape | decodes to 32 bytes **and** signs an HMAC |
| `ADMIN_USER_ID_ARR` | shape | every entry is a uuid, and the failing index is named |
| `ADMIN_PASSWORD` | skip | present and not empty |
| `RESEND_SECRET` | live | `GET /domains` → 200 |
| `NEXT_PUBLIC_SUPPORT_NOTIFICATION_EMAIL` | shape | is an email address |
| `CRON_SECRET` | skip | present and not empty |

## 2. TODO and decisions made AGAINST

### Reproduction steps

**Prove the push guard works:** `git push` twice. The second prints `keys checked today, next check
in 3 days` and pushes without a single request.

**Prove a revoked key is caught:** change one character of `TELEGRAM_BOT_TOKEN` in the local dotenv
file, run `pnpm test:keys` → `✘ TELEGRAM_BOT_TOKEN — 401 Unauthorized`. Put the character back.

**Prove the prod gate works:** send the curl in `dev_readme-supabase-sql.md` twice. First answers
`{"ok":true,"checked":14}`, second answers `{"skipped":true,"daysSinceLastRun":0}`.

### What differs from 23_store

- **No vitest here**, and none is being added. The pure-logic cases live in
  `tests/checkKeys.test.mjs` under `node --test`, next to the existing
  `tests/resolveSeasonalTheme.test.mjs`.
- **No `resend` package.** The alert email goes out over `POST https://api.resend.com/emails` with
  built-in `fetch`, so nothing is installed for one request.
- **The example file is `.env.local.example`**, not `.env.example`, so the drift test reads that name.
- **`env.d.ts` says "AI - DO NOT edit this file - ask me and I do it myself".** The three new
  declarations were handed over as lines to paste, never written by the assistant.
- **`app/libs/redis.ts` already exports a shared client**, so `keysCheckRedis.ts` imports it rather
  than building a second one.
- `response-variable-naming` is stricter here than in `23_store` — it wants `fetchResp`, not `resp`.

### Decisions made AGAINST

- **Cypress** — this project has none, and asking Supabase "is this key valid" is one HTTP request
  from node, not a browser flow.
- **The `dotenv` package** — `node --env-file` reads the same format, built into node since 20.6.
- **A Supabase table for the run history** — the three Upstash keys need no migration and no
  `types_db.ts` edit.
- **A weekly `'0 4 * * 1'` cron string** — then the cadence lives in two places and they drift. The
  cron fires daily and `PROD_CHECK_EVERY_DAYS` is the only gate.
- **A weekly "all good" message** — silence is the healthy state.
- **Stopping a push on a failing key** — the hook always exits 0 and never writes the stamp on a
  failing run, so the next push tries again.

### Known gap

**A stopped cron is invisible.** Nothing yet reads `keys-check:14:last-run` and complains that prod
has not reported in over 10 days. Same gap as `23_store`.
