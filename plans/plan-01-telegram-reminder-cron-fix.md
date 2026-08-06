# plan-01 — Telegram appointment reminder: fires early + cron schedule never gets deleted

**Priority:** P1 (blocks removing `@aws-sdk/client-scheduler`)
**Screenshot:** — (found via code read, no screenshot)
**Recommended model:** Sonnet · low-medium thinking — two small, well-isolated fixes
**Status:** 🅿️ Parked — 0 appointments booked on `/appointment` in the last month (and 0 appointments last 3 months - no work on 0 scale). Steps 1-2 built and committed · steps 3-4 wait on the Supabase deploy — see §5
**Depends on:** —

## §0 Why

- `app/[locale]/(site)/actions/scheduleTgNtfctnAction.ts:58-60` — the cron schedule text includes both the exact day
  number and the weekday name for the same booking. Cron reads "day number OR weekday", not "day number AND weekday",
  so on some bookings the reminder fires on an earlier matching weekday that month, days before the real appointment.
- `dev_readme-supabase-sql.md:528` — after the edge function sends the message, it is supposed to delete its own cron
  schedule. That delete line has a typo and the job name inside it is written wrong, so the delete never runs. The
  cron schedule is left behind permanently, and every successful send also triggers a needless failure email for the
  delete step.
- The booking message text was traced end to end and only ever gets stored and displayed — it is never run as a
  command anywhere. Nothing to fix there.

## §1 Where it lives

| Piece                                                                      | File                                                                                                |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Creates the cron schedule                                                  | `app/[locale]/(site)/actions/scheduleTgNtfctnAction.ts:58-72`                                       |
| Deletes a cron schedule correctly (reference — copy this)                  | `app/[locale]/(site)/actions/deleteTgNtfctnAction.ts:28`                                            |
| Edge function: sends the message, then should delete its own cron schedule | `dev_readme-supabase-sql.md:409-554` (this file is where edge function code lives, per `CLAUDE.md`) |

## §3 Expected behavior

```
BEFORE                                          AFTER
book call for Tue the 15th, 14:00               book call for Tue the 15th, 14:00
  -> schedule also matches every other Tuesday    -> schedule matches only that one day
  -> reminder can fire days early ✗                -> reminder fires exactly 10 min before ✓

edge function sends message                     edge function sends message
  -> tries to delete its own cron schedule          -> tries to delete its own cron schedule
  -> delete command is broken, nothing happens       -> delete succeeds
  -> cron schedule stays forever ✗                   -> cron schedule is gone ✓
  -> extra failure email every time ✗                -> no failure email ✓
```

## §4 Steps

> ONE TASK AT A TIME. Do task N, then STOP — show Nikita the diff and wait for his review. Do not start task N+1 until
> he approves.

1. **Fix the early-fire bug.** In `scheduleTgNtfctnAction.ts:60`, drop the weekday part from the cron schedule text,
   keep only the exact day number, so the schedule matches just the one intended appointment. STOP — show the diff,
   wait for review.
2. **Fix the never-deletes bug.** In `dev_readme-supabase-sql.md:528`, replace the broken delete line with the exact
   working version already proven correct at `deleteTgNtfctnAction.ts:28` (correct spelling, job name written
   directly instead of broken). STOP — show the diff, wait for review.
3. **Prove it works.** Book a real appointment about 11 minutes out, watch the reminder land in Telegram at the right
   time, then run Nikita's three check queries to confirm the cron schedule is gone afterward:
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE 'telegram_notification_%';
   SELECT * FROM telegram_notifications ORDER BY scheduled_for DESC LIMIT 5;
   SELECT status, return_message, start_time FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```
   STOP — report the result, wait for his go-ahead to remove `@aws-sdk/client-scheduler`.
4. **Remove the leftover dependency.** Once step 3 is confirmed, run `pnpm remove @aws-sdk/client-scheduler`.
   Record `pnpm exec tsc --version` before and after — this project pins `@types/*`, `autoprefixer`, and `postcss` to
   `"latest"`, so a stray version bump is possible on any `pnpm add`/`pnpm remove`. If the version moved, undo with
   `git checkout package.json pnpm-lock.yaml && pnpm install`.

## Decisions made (do not re-open)

- Both bugs get fixed in this one plan — Nikita's pick, option 1.
- The timezone hardcode, the plaintext key sitting in the cron schedule body, and the unescaped message text in the
  failure email are NOT part of this plan — separate follow-ups only if Nikita wants them later.
- The booking message itself needs no fix — confirmed it is never run as a command.

## Code patterns to follow

- `dev_readme-supabase-sql.md` is the one place edge function code lives — any edge function edit goes there, per
  `CLAUDE.md`.
- Match `deleteTgNtfctnAction.ts:28`'s exact working delete line rather than inventing a new one — same fix already
  proven correct in this codebase.

## §5 Where we left off — 2026-08-03

### Done and committed — nothing left for me here

| Step              | Commit                                       | What changed                                                                       |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1 fires early     | `b7bf845 fix: tg reminder fires days early`  | `scheduleTgNtfctnAction.ts:60` — cron string ends with `*` instead of the weekday  |
| 2 never deletes   | `030839d fix: cron schedule never deleted`   | `dev_readme-supabase-sql.md:530` — `PERFORM cron.unschedule('${cronJobName}');`    |
| the write-up      | `3d18f25 docs: edge fn deploy + checks`      | `## Edge functions` section at `dev_readme-supabase-sql.md:358`                    |
| outside this plan | `67eb72a upd: tg message via SDK not action` | browser → `TelegramSDK` → `/api/telegram/send-message`; server code calls the util |

- `pnpm exec tsc --noEmit` clean at that point.
- `pnpm lint` 1 warn 0 errs — that one warn is the §4 step 4 dependency below.

### 🚨 TODO — mine, nothing else moves until these run

1. Supabase → Edge Functions → `sendTgNtfcnAppointment` → Edit function → select all → paste the
   block at `dev_readme-supabase-sql.md:360` → Deploy updates → Details shows a higher version
   number. Until this runs the live function still holds `PERFORRM` and no schedule deletes itself.
2. same screen → Secrets → the six names listed at `dev_readme-supabase-sql.md:559` all exist.
   `SERVICE_ROLE_KEY` is the one to double check — it has no `SUPABASE_` in front of it.
3. `/appointment` at :19 or :49 MSK → pick the next slot → "I will show up for the call." ticked →
   "Send a reminder 10 minutes before." ticked → target switched to Telegram → username filled.
   Budget is 2 bookings per UTC day per ip+cookie.
4. SQL editor → run the queries at `dev_readme-supabase-sql.md:574` → the 5th field of `schedule`
   must be `*`, and `scheduled_for` is the booking time minus 10 minutes.
5. Edge Functions → Test → POST `{"notificationId":"<the id from query 2>"}` → expect `{"ok":true}`
   and the Telegram message → re-run the queries → 0 rows in both, and no failure email.
6. tell Claude what 4 and 5 answered.

### Waiting on Claude, after my step 6

- §4 step 4 — `pnpm remove @aws-sdk/client-scheduler`, still sitting at `package.json:15`.
- Record `pnpm exec tsc --version` before and after; `"latest"` pins here can move on any remove.
- If the version moved: `git checkout package.json pnpm-lock.yaml && pnpm install`.

### Known gaps — real, and not part of this plan

- **Timezone.** The schedule numbers written are Moscow local, and pg_cron reads them in its own
  timezone. `SELECT current_setting('cron.timezone', true)` answering `UTC` means the reminder fires
  3 hours late. This is why step 5 above proves the fixes instead of waiting for the timer.
- **The service role key sits in plaintext** in the cron body — `scheduleTgNtfctnAction.ts:68`.
- **The message text goes unescaped** into the failure email inside the edge function.
- **`/api/telegram/send-message` has no rate limit.** Adding one needs the rate-limit helper from
  `app/libs/rateLimitServer.ts`, whose export name trips the banned-words guard on any new file, so
  that export gets renamed first.

### Doc state

- `## Edge functions` headings run 1 → 3 → 4 → 5. Section 2 (dashboard deploy steps) was cut on
  2026-08-03, and the Secrets block that followed it now sits under section 1.
- Renumber or write a fresh section 2 — open question, nobody has decided.

➡️ No next plan queued. A new Supabase issue found today goes in a NEW chat with this file as the
hand-off, not into this plan.
