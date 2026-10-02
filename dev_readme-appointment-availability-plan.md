# Appointment availability and admin blocking — implementation handoff

Prepared 2026-10-01 for `/home/kali/Documents/GitHub/14_portfolio`.

This is a plan, not an implemented fix. The user requested investigation and a detailed handoff for a new chat. All three issue screenshots and the admin design references were inspected. No application code, database, deployment, or notification was changed while preparing this document.

## 1. Outcome and agreed scope

A visitor can leave `/appointment` open for hours. A selected time must never remain bookable merely because it was valid when the page loaded. Every new booking and change of booking time must check current server time and current database availability.

A slot is unavailable if:

1. The admin blocked it.
2. It starts less than 30 minutes from the authoritative current time, including any past time.
3. Another booking occupies it.

On rejection, explain the actual reason in a localized toast, refresh availability, suggest/select a valid replacement if one exists, and require another explicit booking confirmation. Preserve the visitor's form details. Never submit a replacement automatically.

Admins whose authenticated Supabase user ID is in `ADMIN_USER_ID_ARR` need an easy way to block and unblock individual slots or a time window from `/admin-dashboard`. Use the existing gray metallic 3D small-dot UI.

Use ordinary HTTP requests and database enforcement. Pusher, WebSockets, background subscriptions, a new scheduling provider, and recurring availability rules are outside this task.

### Defaults chosen so implementation can proceed

- Minimum notice means **at least** 30 minutes: `startsAt >= authoritativeNow + 30 minutes`. Exactly 30:00 is valid at the instant of the write-time check; 29:59.999 is not. Do not truncate current seconds/minutes.
- Preserve all 21 existing start times: 12:00, 12:30, …, **22:00 inclusive**, in `Europe/Moscow`. Slot spacing does not establish a meeting duration; do not invent duration/overlap rules.
- Blocks apply to concrete dates and start times, not every occurrence of a weekday.
- A range is start-inclusive and end-exclusive: blocking 15:00–18:00 blocks starts at 15:00 through 17:30; 18:00 remains available. The UI must show this clearly. Selecting the 18:00 tile explicitly also blocks 18:00.
- Existing appointments survive blocking/unblocking. Booked tiles cannot be blocked or unblocked through the block controls. Cancellation remains a separate existing action.
- Admin scheduling defaults to **MSK**, matching the existing booking list. Offer a compact MSK/local-time display control, labelled with the actual zone, e.g. `Europe/Berlin`. Public booking keeps its existing timezone picker. Convert full date-times in both cases.
- Blocks can be created for any future valid start, including a start already inside the visitor's 30-minute cutoff. Past starts are read-only; unblocking does not override the visitor's notice requirement.
- Any allowlisted admin can remove an admin block; record who originally created it. No mandatory reason field or extra confirmation dialog is needed for this reversible action.

## 2. Screenshot evidence

Directory: `/home/kali/Pictures/TODO December/14`.

| File | Observed requirement |
| --- | --- |
| `20.09.2026 at 17-38.jpg` | A Telegram booking notification shows a same-day time already in the past. The annotation describes a tab opened at noon and submitted hours later. |
| `20.09.2026 at 18-05.jpg` | The picker still shows 18:00 when the desktop clock is 18:04. The annotation asks for a toast and a selection at least 30 minutes ahead. |
| `21.09.2026 at 13-58.jpg` | The annotation asks to close a window such as 15:00–18:00 in a few clicks when the admin is busy. |

Design contract: `app/[locale]/(site)/admin-dashboard/dev_readme-ui-gray-3d-small-dot.md`. Its three image references were also inspected. Reuse the existing CSS/SVG relief components; never embed the reference JPG/WebP files as UI textures.

## 3. Current repository facts — read before changing files

At investigation time, branch was `production`, HEAD `5f6765a`, and the worktree was clean. Re-check these in the implementation chat; do not assume old branch/state notes in unrelated plans are current. Create an isolated implementation branch when appropriate. This plan does not request a production deployment, a push, or real Telegram messages.

No applicable `AGENTS.md` was found. `dev_readme.md` links to `AI_readme_code-sytle-patterns.md` and `AI_UI_skill.md`, but neither file exists in this checkout. `commit-patterns.md` exists; read it if committing. The older Halloween and Telegram plans describe separate tasks and are not the task list for this work.

Technology already present: Next.js 16, React 19, TypeScript, Moment Timezone, Zustand, Supabase, react-calendar, next-international. Reuse these. Existing tests use Node's test runner and `tests/alias-hook.mjs`; `package.json` enumerates test files explicitly.

### Relevant files and defects

| File | Current behavior / required change |
| --- | --- |
| `app/api/insert/booking/route.ts` | Checks for an existing booking, then inserts in a separate request. No notice or slot-grid validation. Ignores the existence-query error. Calls `contact.trim()` before validating its type. Add runtime parsing, canonical date-time input, write-time enforcement, and structured errors. |
| `app/api/bookings/taken-slots/route.ts` | Returns booked MSK time strings only. Database failures become an empty list. Replace app callers with a proper availability endpoint; retain this route as a safe compatibility wrapper if keeping it. |
| `app/[locale]/(site)/appointment/components/TimePicker.tsx` | Fetches on date changes only. Its error path treats every slot as free. Several competing effects set defaults. It sometimes checks a substituted tomorrow instead of the actual selected date. Replace with shared availability state. |
| `app/[locale]/(site)/appointment/components/ScheduleAppointment.tsx` | Mount-only default selection; Continue opens the modal without revalidation. |
| `app/[locale]/(site)/functions/bookACallFn.ts` | Sends serialized browser `Date` plus separately converted MSK clock time. Throws away structured errors and only displays error text. Calls Telegram after success. |
| `app/store/useAppointmentStore.ts` | Stores date and display-time separately; selected time cannot represent no selection. Add a canonical selected instant, availability state, and an immutable confirmed-booking snapshot. |
| `app/[locale]/(site)/functions/convertCurrentToTargetTimezone.ts` | Converts an HH:mm using today's date. Wrong around selected-date DST changes and cross-midnight conversions. Stop using it for booking identity. |
| `app/[locale]/(site)/functions/getNextAvailableTimeMSK.ts` | Chooses a later clock time without 30-minute notice, occupancy, or an associated date. |
| `app/[locale]/(site)/functions/isDisabledFn.ts` | Compares hours/minutes for today only; no notice margin and no reliable past-day rejection. |
| `app/utils/isDateBeforeTodayOrTime.ts` | Hardcodes 21:30 as the end of today; replace with shared slot-based logic. |
| `app/[locale]/(site)/actions/updateDBAppointmentAction.ts` | Rescheduling bypasses notice/grid/block checks and uses a separate duplicate read. Also lacks caller ownership/admin checks. Apply the same rules as creation. |
| `app/[locale]/(site)/actions/deleteDBAppointmentAction.ts` | Deletion must release occupancy through the database; validate visitor ownership or admin identity before deletion and reminder work. |
| `app/[locale]/(site)/hooks/useBookingActions.ts` | Currently assumes actions either return void or throw. Add typed results so rescheduling can retain reason codes. |
| `app/[locale]/(site)/appointment/components/BookedAppointments.tsx` | Visitor rescheduling uses unrestricted date/time inputs and clock-only conversion. Use the same availability selector, initialized from the booking's full instant. |
| `app/[locale]/(site)/admin-dashboard/components/BookingItem.tsx` | Admin rescheduling also needs the common availability rules and reason messages. |
| `app/[locale]/(site)/functions/formatedDateTimeFn.ts` | Summary/Telegram formatting must use the selected or confirmed full instant, not a local date combined with another zone's clock. |
| `app/components/Modals/ScheduleAppointment/components/Step2.tsx` | Calls `bookACallFn`; needs explicit success/failure result and preserved form default values after recovery. |
| `app/views/AppointmentPageView.tsx` | Its server-local `today` filter can exclude relevant bookings around timezone boundaries. Query with a safe Moscow-date bound and format/filter using full instants. |
| `app/views/AdminDashboardPageView.tsx` | Existing server auth uses `auth.getUser()` and `parseAdminUserIdArr`. Reuse this identity rule for every new admin request. |

**Routing trap:** the real route is `app/[locale]/(admin)/admin-dashboard/page.tsx`, with layout and CSS under `(admin)`. The admin components and design document remain under `(site)/admin-dashboard`. Do not create a second `page.tsx` under `(site)/admin-dashboard`.

**Schema uncertainty:** `dev_readme-supabase-sql.md` shows only a booking primary key on `id`; no slot uniqueness is documented. The generated types include contact columns absent from that CREATE TABLE. Actual production constraints/triggers/columns were not inspected. Check them before applying SQL.

**Generated types instruction:** `app/interfaces/types_db.ts` explicitly says: `AI - DO NOT update this file - you have NO access to it - send me updates I need to make in chat instead`. Do not edit it. Add a narrow local type extension for the new table/RPCs and a typed server adapter, then provide the exact type additions/regeneration instructions in the handoff. This need not block application implementation or type-checking.

## 4. One date-time model

Create shared pure helpers, suggested location `app/libs/appointmentSlots.ts`, with no server secrets or React imports. Use the existing `appointmentTimesMSK` array as the JavaScript schedule source.

Core values:

```ts
type AppointmentSlot = {
  startsAt: string // canonical UTC ISO instant, e.g. 2026-10-02T12:00:00.000Z
  bookingDate: string // Moscow YYYY-MM-DD, e.g. 2026-10-02
  timeMSK: string // HH:mm, e.g. 15:00
  status: "available" | "booked" | "blocked" | "past" | "too_soon"
}

const APPOINTMENT_TIMEZONE = "Europe/Moscow"
const MIN_BOOKING_NOTICE_MS = 30 * 60 * 1000
```

Implement and test these operations before wiring the UI:

1. Strictly parse a Moscow date plus grid time into an instant. In SQL the equivalent is `(booking_date + "booking_time_MSK") AT TIME ZONE 'Europe/Moscow'`.
2. Strictly parse API instants. Require an explicit timezone/offset, reject invalid/normalized dates and nonzero seconds/milliseconds, and round-trip to a valid Moscow schedule time. Do not accept timezone-less strings using the machine's timezone.
3. Convert an instant into a full date and time in a selected IANA zone. Keep the date adjustment when crossing midnight.
4. Build candidate slots for a **display calendar day in the selected zone**. Determine that day's start and the next local midnight, find intersecting Moscow dates, generate each Moscow day's grid, then filter to the local-day interval and sort by instant. Do not assume a local day is always 24 hours.
5. Derive `past`/`too_soon` from a passed-in `nowMs`, not a global captured when the page mounted. Precedence for display/rejections: past, too soon, blocked, booked, available. Both past and too soon explain the 30-minute requirement.
6. Select the earliest available candidate, or return `null`. Before noon, later slots today remain valid. At/after the end of the day, do not substitute tomorrow's clock while retaining today's date.

The calendar's value is a day label, not an instant. Adapt react-calendar's Date object to a `YYYY-MM-DD` day key deliberately; do not serialize its local midnight as the booking identity. Store `selectedSlotStart: string | null` as the booking identity. Derive time labels from it. Keep calendar browsing date/timezone separately. Remove redundant writable `selectedTime` state or make its compatibility accessors derive from the instant.

Changing timezone preserves an already selected instant and updates the displayed date/time. Then refresh the corresponding display day. If no slot is selected, keep a sensible day in that zone and await availability. Do not reset to 12:00 merely because the timezone changed.

The Node/server timezone, browser timezone, display timezone, and Moscow schedule timezone may all differ. No validation may rely on the first two.

## 5. Database enforcement and migration

### Chosen design: a shared occupied-slot table

Use one table, suggested name `public.appointment_slot_occupancy`, for both booked and blocked starts. This avoids trying to enforce cross-table exclusivity with two independent SELECT checks.

| Column | Shape |
| --- | --- |
| `starts_at` | `timestamptz PRIMARY KEY`; only one owner of an instant |
| `kind` | text constrained to `booked` or `blocked` |
| `booking_id` | same string type as `bookings.id`; nullable, UNIQUE, FK to bookings with `ON DELETE CASCADE` |
| `blocked_by` | nullable UUID; verified authenticated admin ID, set only by server |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |

Add a row-shape CHECK: booked means a non-null `booking_id` and null `blocked_by`; blocked means null `booking_id` and non-null `blocked_by`. Absence of a row means the slot is unoccupied, not necessarily bookable; the notice/grid rules still apply.

The primary key is the final arbiter when concurrent operations compete. PostgreSQL enforces primary-key/unique constraints across table rows. This is the basis for the proposed shared-table design. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

### Booking trigger behavior

Use a non-deferred row trigger for booking INSERT and changes to the date/time columns. Keep normal application inserts/updates, but make the database enforce the invariants even if another code path writes directly.

For creation or an actual time change:

1. Derive the full Moscow booking instant.
2. Validate the 12:00–22:00 grid, zero seconds, and the current 30-minute notice.
3. Claim the corresponding occupancy row as `booked` using an INSERT. Never overwrite a conflicting row.
4. For rescheduling, remove only this booking's old claim and claim the new instant in the **same transaction**. If claiming fails, the old booking and old claim must survive unchanged. Handle no-op reschedules without releasing/reclaiming the slot or resending notifications.
5. Recheck notice after any unique-key wait, immediately before the trigger succeeds. This closes the boundary where a request waits on a lock and falls inside 30 minutes while waiting.
6. Raise documented stable errors for invalid slots and notice violations. On an occupancy collision, preserve the failure and let the server identify the current occupant for its user-facing reason. An unrelated duplicate `bookingId` is not a slot-taken error.

An AFTER row trigger is suitable because the parent booking exists for the occupancy FK. Trigger failure rolls back both the booking operation and its related writes. Use normal transaction rollback; do not try to repair a failed reschedule with later HTTP requests. [PostgreSQL trigger transactions](https://www.postgresql.org/docs/current/trigger-definition.html)

Use `clock_timestamp()` for the write-time notice check: `now()` is fixed at transaction start. Do not put a changing current-time expression into a permanent CHECK constraint. The 30-minute rule validates a new/moved booking, not historical rows as they age. [PostgreSQL date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html)

Deleting a booking cascades only its booked occupancy row. That also releases a claim when the existing creation flow rolls a booking back after a reminder/quota failure. Admin blocks are independent rows and must survive unrelated booking deletions.

### Block/unblock RPC

Add a small transaction function, e.g. `set_appointment_blocks(p_starts_at timestamptz[], p_blocked boolean, p_actor_id uuid)`.

- Only the server service-role client may call it; the server derives `p_actor_id` after checking `ADMIN_USER_ID_ARR`.
- Validate and deduplicate input, cap it at 64 slots per request, and sort ascending before writes to reduce conflicting lock orders. No caller-supplied SQL.
- Block: validate future schedule starts. Insert blocked occupancy records. An already blocked slot is an idempotent no-op; retain its original creator/time. A booked conflict aborts the batch, preserving existing appointments and all preexisting blocks.
- Be precise about `ON CONFLICT`: a blanket `DO NOTHING` would silently skip booked slots. Distinguish an existing block from a booked conflict after the unique-key decision, inside the function, and return accurate counts or a conflict.
- Unblock: delete only rows where `kind = 'blocked'` and the instant is requested. Already free slots are no-ops. Never delete a booking or booked occupancy record.
- A batch is atomic. If a slot was booked after the admin selected it, return a conflict and refresh the admin grid; the admin can retry the remaining free selection.

Enable RLS on the new table with no public write/read policy; public reads go through a sanitized server endpoint. Explicitly revoke RPC execution from `PUBLIC`, `anon`, and `authenticated`, then grant to `service_role`. Prefer invoker functions for this service-role-only path; if any function uses SECURITY DEFINER, fix its search path and qualify table names. Supabase documents that function execution permissions need explicit restriction. [Supabase database functions](https://supabase.com/docs/guides/database/functions)

### Migration procedure

Keep a clearly labelled, complete runnable migration block in `dev_readme-supabase-sql.md`, consistent with the repository's current SQL workflow. Include preflight and verification SQL beside it. Do not add an unrelated migration framework.

1. Inspect actual columns, constraints, triggers, RLS and grants. Record the deployed PostgreSQL version. Use the existing schema as authoritative; the documentation alone is not proof of production state.
2. Query duplicate `(booking_date, booking_time_MSK)` pairs and bookings with off-grid/invalid times. Report affected IDs without automatically deleting or changing appointments. Duplicate instants must be resolved before unique occupancy backfill; continue independent code work while a data decision is pending.
3. In a transaction, take a short write-blocking lock on `bookings` during backfill/trigger installation, so an existing server cannot create an untracked booking in between. Create occupancy, backfill existing bookings, install triggers/RPC/grants, and commit together.
4. Backfill historical bookings without applying the new notice rule retroactively. Preserve off-grid historical data; validate the grid on new/moved bookings and new blocks. Do not make a table-wide time CHECK accidentally reject historical imports.
5. Verify one correct booked claim per booking, no orphan claims, triggers installed, and restricted grants. Make reruns safe by checking/reconciling existing objects; do not blindly drop tables/data.
6. Update the initial-setup SQL section too, so future setup does not omit the new enforcement.
7. Add the local database type extension and server adapter; leave `types_db.ts` unchanged. Explain how the user can regenerate/update it later if wanted.

One concrete access issue to verify during migration: the documented `execute_any_sql(TEXT)` is SECURITY DEFINER and grants execution to `authenticated`. If still exposed that way, callers could bypass admin-only blocking by issuing arbitrary SQL. The portfolio's current callers use service-role clients. Inspect deployed permissions and any other consumers in the shared database; prepare a narrowly scoped revocation from PUBLIC/anon/authenticated and grant service_role, with consumer impact recorded. Do not revoke unrelated functions or break another project's caller silently. An admin-only claim is not complete while an exposed privileged arbitrary-SQL path can mutate the new table.

## 6. Server API contracts

Suggested new code boundaries:

- `app/libs/appointmentSlots.ts`: pure date/slot rules.
- `app/libs/appointmentAvailabilityServer.ts`: server-only database reads and error mapping.
- `app/libs/appointmentDatabase.ts` plus `app/interfaces/AppointmentDatabase.ts`: narrowly typed access to new schema using the existing service-role client; no duplicate environment setup.
- `app/api/bookings/availability/route.ts`: sanitized public availability.
- `app/api/admin/appointment-slots/route.ts`: authorized admin read/block/unblock.
- `app/api/api.d.ts`: HTTP contracts only; it explicitly prohibits imports.

### Public availability

`GET /api/bookings/availability?date=YYYY-MM-DD&timezone=Europe/Berlin`

Validate day and IANA timezone. Generate candidates for that display day, read occupancy in the corresponding instant interval, and return:

```ts
type AppointmentAvailabilityResponse = {
  ok: true
  date: string
  timezone: string
  serverNow: string
  minimumNoticeMinutes: 30
  slots: AppointmentSlot[] // no contacts, user IDs, booking IDs, or admin IDs
}
```

Use `Cache-Control: no-store` and client `cache: 'no-store'`. Database failure returns a 5xx structured failure, never `{ slots: [] }` as a success. The UI distinguishes loading/error from a genuinely empty day. If the older taken-slots route is retained, read the same occupancy source, include blocked starts in its unavailable union, and return an actual error on failed reads.

For rescheduling, allow the caller's own existing start to appear as the current appointment. If implementing `excludeBookingId`, verify ownership/admin access on the server before excluding anything; do not expose an unguarded exclusion query that any visitor can use. An unchanged start is a no-op, not a new booking.

### Final booking POST

Keep `/api/insert/booking`, but make the new request identify the chosen slot by `startsAt` rather than `selectedDate` plus `atMSK`. Derive Moscow date/time server-side. Keep the existing contact/channel/notification fields and rate limits.

```ts
type SlotFailureCode =
  | "SLOT_IN_PAST"
  | "SLOT_TOO_SOON"
  | "SLOT_BLOCKED"
  | "SLOT_BOOKED"
  | "SLOT_UNAVAILABLE" // fallback if a race prevents precise classification
  | "INVALID_SLOT"
  | "SELECTION_REFRESH_REQUIRED" // old request shape
  | "AVAILABILITY_UNAVAILABLE"

type SlotFailure = {
  ok: false
  code: SlotFailureCode
  error: string // safe English fallback for old clients
  serverNow: string
  minimumNoticeMinutes: 30
}
```

- Parse JSON/runtime values safely before using strings or enums. Do not trust a TypeScript cast as validation.
- Keep burst protection. Read/validate server time again on each attempt; the database performs the decisive write-time check.
- Any pre-read is for a friendly early answer. It cannot replace the database claim.
- Map invalid input to 400; unavailable/expired/blocked/booked slots to 409; backend outage to 503/500; preserve 429 for existing rate limits. Include current server time in slot-related replies.
- Identify known database trigger/constraint errors explicitly. Do not label every database error as booked. If the occupancy owner disappeared during error classification, return `SLOT_UNAVAILABLE` and refresh.
- Return success with the authoritative `{ id, startsAt, bookingDate, timeMSK }` so the client can freeze the confirmed selection.
- Validate before reminder scheduling, Telegram notification, or daily quota consumption. Existing burst attempts may still be counted; slot conflicts must not consume the successful-booking quota.
- Preserve existing reminder/quota rollback behavior. A rejected slot must create no booking, claim, reminder, cron job, or success notification.
- A backend read or missing migration must stop the booking. There is no fallback to an unchecked insert.

**Old tabs after deployment:** the old payload cannot reliably tell us its display timezone/date semantics. Reject legacy requests without `startsAt` with `SELECTION_REFRESH_REQUIRED` and a useful fallback message asking the visitor to reload and choose a time. The old client already displays `error`, so this is safe. Do not guess an ambiguous date or accept the old payload through a second unchecked path.

### Reschedule and delete actions

The public visitor is identified by the existing `user_cookie_id`; the admin is identified by verified Supabase user ID. Reuse this authorization model, validate before reminder queries/mutations, and scope the booking lookup/mutation to the authorized booking. Missing visitor cookies do not grant access or generate ownership on edit/delete.

Change reschedule arguments to a booking ID and canonical next `startsAt`; obtain the previous time/channel from the database rather than caller arguments. Use the same grid/notice checks and database trigger as new bookings. Return a discriminated action result so `useBookingActions` can pass stable reason codes to both UIs; custom properties on thrown server errors are not a reliable transport contract.

Availability rejection must happen before deleting an old reminder. On rejection the original appointment, claim, and reminder remain unchanged. Keep reminder work consistent on accepted changes and report any post-write notification failure as such; do not present a committed move as an unavailable-slot failure. Do not expand into the older parked cron-delivery redesign.

### Admin endpoint authorization

For **every** GET and mutation:

1. `(await supabaseServer()).auth.getUser()`.
2. Check the verified ID against `parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)`.
3. Only then access service-role reads/writes. Reuse or generalize the tested pattern in `adminAnalyticsAccess.ts` without changing analytics behavior.
4. Return 401 for no valid session and 403 for a valid non-admin session. Never accept an admin flag/ID/allowlist from the request or rely on page access alone.

GET takes display day/timezone and returns slot statuses needed by the admin, with no unnecessary booking contact data. In the admin response, expose occupancy (`free | booked | blocked`) separately from time eligibility (`eligible | too_soon | past`). A single public status value is insufficient: a blocked start inside 30 minutes must still be identifiable as a block that the admin can remove. Derive both fields from the same database result and server clock.

POST accepts `{ startsAt: string[], blocked: boolean }`; the server supplies actor ID. Validate size/types/date-times and reject an unexpected cross-origin mutation when an Origin header is present. Return changed/no-op counts, refresh on success or conflict, and use no-store responses.

## 7. Public picker and stale-tab recovery

Put request orchestration in an availability client helper/hook, e.g. `app/[locale]/(site)/appointment/hooks/useAppointmentAvailability.ts`. Keep Zustand setters synchronous; the existing lint configuration discourages async store methods. Reuse shared state rather than giving TimePicker, Continue, and the booking modal independent availability lists.

Required state: current day/zone, selected instant or null, server-time anchor, slots, loading/error, request generation, and confirmed booking snapshot. Use AbortController or request generation checks so an older response cannot overwrite a newer day/zone or restore a rejected slot.

Refresh on:

- initial mount;
- changing day or timezone;
- opening the time picker;
- returning to a visible tab or window focus, with duplicate events coalesced;
- Continue to booking;
- an unavailable-slot response;
- successful booking/cancellation/rescheduling relevant to the displayed day.

Also recalculate time eligibility locally about every 30 seconds while visible, using the server-time anchor plus elapsed time. No network poll every second is needed. Re-anchor after tab/device sleep and on fresh responses. This timer improves the picker; it does not authorize a booking. Recheck immediately on user actions and always validate final POST on the server.

### Selection rules

- Loading or availability error: do not show unknown times as free. Disable Continue/submit until a valid state exists; offer Retry.
- First successful load: choose the earliest available start on the displayed day.
- Keep a currently valid selected instant stable across refreshes.
- If a selected instant becomes invalid, select the earliest remaining available start on that day and inform the user that the time changed. If there is none, set selection to null and ask for another day.
- Keep the calendar navigable when today has no starts left. Never keep a fake 12:00 fallback or enter an unbounded search across days.
- Continue performs a fresh availability read. If the old selection is invalid, recover and show the toast, but do not open/advance the modal on that same click. A second click confirms the displayed replacement.
- While the details modal is open, do not silently substitute another start beneath an active form or in-flight POST. Flag invalid selection and return to the picker with a reason. Snapshot the attempted instant before async work begins.
- After a booking succeeds, freeze the confirmed instant used by Step3 and Telegram/Discord instructions. Background refreshes must not rewrite the success screen to the next free time.

### Rejection flow

1. Receive a structured slot failure.
2. Stop pending animation and retain contact method/contact, channel, note, reminder choice/recipient, timezone, and show-up choice.
3. Close the appointment modal, return its step to the initial booking step, and make the calendar/time selector reachable/focused. Do not reset the user's form data.
4. Refetch the same display day's availability. If it fails, keep a clear error state and no valid selection; allow Retry.
5. Select a replacement or null using the above rules. Show the rejection reason and ask the visitor to confirm another time. Never automatically POST it.
6. On reopening the details form, initialize React Hook Form from the retained store values so visual fields actually match preserved state.

Suggested toast copy, localized in `app/locales/{en,ru,ua,de,pl}.ts`:

| Code | Copy |
| --- | --- |
| `SLOT_IN_PAST` | “That time has already passed. Please choose a time at least 30 minutes from now.” |
| `SLOT_TOO_SOON` | “Appointments need at least 30 minutes' notice. Please choose a later time.” |
| `SLOT_BLOCKED` | “The host is unavailable at that time. Please choose another time.” |
| `SLOT_BOOKED` | “Someone else has just booked that time. Please choose another time.” |
| `SLOT_UNAVAILABLE` | “That time is no longer available. We've refreshed the times; please choose again.” |
| `AVAILABILITY_UNAVAILABLE` | “We couldn't refresh the available times. Please try again.” |

Only say “We've refreshed” after a successful refresh. If a replacement is selected, optionally name its full displayed date/time. Deduplicate idle refresh toasts; do not show the same warning every timer tick. Render with the existing `useToast`/`ToastWrapper` components.

## 8. Admin UI — quick block/unblock

Add a new `Availability` operations tab in `AdminDashboardClient.tsx`, adjacent to Bookings. Suggested component: `app/[locale]/(site)/admin-dashboard/components/AppointmentAvailabilitySection.tsx`. This makes the tool directly discoverable and avoids squeezing controls into individual appointment cards.

Minimal layout:

```text
Availability                         [Refresh]
[Today] [Tomorrow] [date picker]     [MSK / Local · Europe/Berlin]

Block starts from [15:00] until [18:00] [Select range]
Times shown in MSK. End time is not included.

[12:00 Free] [12:30 Booked] [13:00 Blocked] ...
Free / Blocked / Booked / Too soon / Past legend

6 selected                           [Clear]
[Block selected] [Unblock selected]  [Select whole day]
```

Behavior:

- Today is selected initially. Slot tiles support click/tap/keyboard selection. A single free slot needs one selection click and Block; multiple tiles share one action.
- Range controls select the starts in that display-zone interval, excluding booked/past starts and explaining excluded counts. `Select whole day` selects the day's applicable tiles, including the 22:00 MSK start if present in that display day.
- Offer a range end after the last displayed start, so the final 22:00 MSK slot is blockable by range as well as by tile. Use generated slot boundaries, not assumptions about all zones having :00/:30 labels.
- Block acts on selected free future starts; Unblock acts on selected blocked starts. Disable actions with zero applicable selections. For mixed selections show the applicable count clearly.
- Booked starts are visually distinct, read-only, and never selected for a block request. For a range containing a booking, preview the free count and booked count; do not imply the entire window is empty of meetings.
- A future start inside the visitor notice cutoff can still be admin-blocked; show its too-soon status separately from occupancy. A blocked near-term start remains removable. Past tiles are read-only.
- During a mutation disable repeat actions. Only show saved state after server success. Refresh the grid after success and conflict. Preserve pending selections when useful on recoverable errors.
- Changing date/timezone discards selections for the prior view. A stale response cannot overwrite the new view. Two admin tabs must converge after refresh; refresh on focus too.
- Return a short result such as “6 slots blocked” / “3 slots unblocked”. Provide inline errors and an accessible live region; reuse a single toast host if adding admin toasts.
- No confirmation modal or mandatory note field for routine blocking/unblocking.

### Visual implementation details

Read the requested design doc again when implementing. Reuse `adminUi.panel`, `toolbar`, `button`, `input`, `field`, `segmented`, `badge`, `error`, `skeleton`, `PanelRelief`, and existing `DotRelief` components from `AdminUI.tsx` and siblings. The older `DashboardCard` uses the site's brass/steel palette; do not use it as the starting point for this admin addition.

Use the existing `--3d-dot-*` colors, gray gradients, inset borders and controlled shadow depth. Small uppercase monospaced labels match the current console; interactive labels must remain readable with practical touch targets. Status must be conveyed by words/icons/pressed state, not color alone. Reuse `playAdminButtonSound` only after user interaction if sounds are added; respect existing motion preferences.

The dashboard already has a fixed-height shell. Give the new tab body its own usable vertical scroll area so the bottom actions remain reachable on 390px-wide screens and short desktop windows. Do not redesign the shell or other tabs.

## 9. Ordered implementation checklist

Execute these in order in the implementation chat. Each item has a concrete stopping criterion for verification, not a requirement to ask for permission between routine code steps.

1. **Baseline and shared rules.** Inspect current git state and relevant files; record existing check failures. Add canonical time helpers and meaningful boundary/timezone tests. Done when valid starts, notice checks, and display-day enumeration are independent of machine timezone.
2. **SQL enforcement.** Write migration/preflight/verification SQL, local types, occupancy trigger, block RPC, and grants. Test against isolated PostgreSQL/Supabase where available. Done when concurrent claims and failed moves behave atomically; production application is a separate deployment step.
3. **Server endpoints/actions.** Implement public availability, admin authorization and mutations, canonical booking POST, structured failures, guarded reschedule/delete. Done when direct requests cannot bypass notice, blocking, or ownership checks.
4. **Public UI and modal recovery.** Replace the old time logic with shared availability, fresh Continue checks, modal recovery, preserved values, and immutable success details. Done when the two-hour stale-tab reproduction rejects correctly and lets the visitor confirm a new slot.
5. **Admin availability tab.** Implement individual/range/day selection and unblock in the existing 3D gray style. Done when a 15:00–18:00 window can be blocked in a few interactions and reopened without disturbing bookings.
6. **Rescheduling and formatting.** Reuse availability on visitor/admin edits; update summaries, booked cards, notifications and timezone switching. Remove obsolete time-only calls when no callers remain. Done when all paths refer to the same instant and blocked/expired reschedules fail without side effects.
7. **Localization and verification.** Add all five locales; run unit/API/database/browser checks below and review the diff. Done when every acceptance criterion has evidence or an explicit environmental blocker.
8. **Deployment handoff.** Provide exact SQL, schema/type steps, deployment order, and verification results. If live DB access/deployment is unavailable or not authorized, finish the local implementation/tests and identify only the concrete external steps left.

Do not treat a styled grid and a browser-only check as completion. The migration, final-write validation, stale-form recovery, and collision tests are all part of the feature.

## 10. Verification matrix

### Pure rules — add `tests/appointmentSlots.test.mjs` to `pnpm test`

- A slot at now minus two hours is past; now is unavailable; +29:59.999 is unavailable; exactly +30:00 and +30:00.001 meet the notice condition.
- At 12:30:00 MSK, 13:00 qualifies. At 12:30:00.001, 13:00 fails and 13:30 is the next grid start.
- Before noon, today's 12:00 is offered when enough notice remains. At 21:30:00, 22:00 qualifies; immediately afterward no same-day start qualifies.
- Invalid days, malformed strings, timezone-less input, off-grid 13:15, seconds, and starts outside the window are rejected.
- Same instant and Moscow date/time under process TZ UTC/Berlin/Los Angeles/Tokyo.
- Berlin winter and summer conversions use the selected date, including DST transition days. Include a future booking date whose offset differs from today's.
- Tokyo or Pacific/Auckland display crosses midnight correctly. A non-hour-offset zone such as Asia/Kathmandu produces the correct labels.
- Calendar-day enumeration excludes adjacent local days, includes all applicable Moscow starts, and handles an empty day.
- Changing display zone retains slot identity. No helper mutates the input list or reuses a stale module-level current time.

### API/action checks — mock external messaging and rate-limit dependencies

- Anonymous/non-allowlisted/admin sessions: admin GET and mutation allow only the verified allowlisted admin; client-supplied IDs cannot bypass this.
- Invalid JSON/missing contact does not throw before returning a controlled 400.
- Past/too-soon/booked/blocked/malformed starts fail with their expected code; no reminder, Telegram call, or successful-booking quota consumption occurs.
- Database errors return 5xx and no selectable-free success response.
- Old POST payload returns the refresh-required message.
- Successful POST returns the canonical booking; accepted side effects follow existing behavior.
- Reschedule into an occupied or expired start leaves the old booking/reminder unchanged. Another visitor cannot move/delete it; the owner and allowlisted admin can perform permitted operations.
- Deleting/rolling back a booking releases its claim without touching admin blocks.
- Errors with unrelated primary-key constraints are not mislabeled as a taken slot.

### Real database integration — a mocked SELECT/INSERT test is insufficient

Run in an isolated test database, with test notifications disabled/mocked. Use two genuinely concurrent connections or API requests and inspect committed rows afterward.

| Scenario | Required result |
| --- | --- |
| Two visitors claim the same start | Exactly one booking and one booked occupancy row; other request gets conflict |
| Visitor booking vs admin block | Exactly one owner wins; never both a booking and a block for the instant |
| Visitor reschedule vs admin block | One claim wins; failed move retains its old appointment and claim |
| Two admins block the same start | One block row; repeats are idempotent and counts truthful |
| Block batch includes newly booked start | Entire new block batch rolls back; existing data remains |
| Failed reschedule | Old row and claim survive; no orphan/new claim |
| Booking delete and creation rollback | Associated booked claim removed automatically |
| Attempt waits across notice boundary | Write-time clock check rejects after the wait |
| Direct unauthorized table/RPC access | Denied with anon and ordinary authenticated roles |

Exercise migration backfill with an old valid booking, a historical off-grid booking, and duplicate starts in a disposable database. Verify the duplicate preflight refuses destructive automatic repair. Do not send real messages or book production appointments for automated verification.

### Browser acceptance

1. Open appointment and select 13:00. Advance the controlled server/test clock by two hours without changing day. Continue/submit must reject the stale start with a toast and refreshed choice. Do not implement a client-controllable production clock override.
2. Repeat while the modal is already open; contact/note/reminder fields survive recovery and the replacement requires confirmation.
3. Tab A selects a future slot. Admin tab B blocks it. A's final POST rejects with blocked reason even without focus refresh.
4. Tab A selects a slot. Visitor tab B books it. A rejects with booked reason.
5. All starts are blocked/booked/too soon: no selected start, Continue disabled, clear empty state, another day selectable.
6. Failed refresh: clear error/Retry; unknown slots are not rendered as free. Rapidly change days/timezones and confirm responses do not arrive out of order into the UI.
7. Admin blocks 15:00–18:00; 15:00…17:30 become blocked and 18:00 remains free if otherwise eligible. Unblock and confirm they reopen subject to notice.
8. Admin range contains a booking: the preview explains the occupied start; the existing appointment remains. If a booking races the action, show conflict and refreshed state.
9. Successful booking's confirmation date/time remains stable after the availability list refreshes.
10. Test 390px and desktop widths, keyboard focus/selection, screen-reader labels, reduced motion, localized strings, and all existing admin tabs.

Run repository checks after implementation:

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm lint
git diff --check
pnpm build
```

Run a production build without interfering with a running development server; use a separate checkout/output if needed. Record baseline failures separately. `pnpm test:keys` checks live integrations and is not required for this feature; do not run it as a substitute for booking tests. Do not claim database concurrency or browser verification if only unit tests were run.

## 11. Deployment order and completion criteria

The planning chat did not inspect or alter the live database. Treat SQL rollout as required work, not an assumption that editing a Markdown SQL block changes Supabase.

Recommended rollout:

1. Finish code and isolated tests; review preflight results and exact runnable SQL.
2. Apply the migration on the intended Supabase database, including occupancy backfill and grants. Resolve any duplicate-data blocker explicitly. Database triggers protect old application writes once installed.
3. Verify occupancy consistency and run controlled non-notifying checks.
4. Deploy the application. Old browser bundles receive the explicit refresh-required message; new bundles use canonical instants.
5. Verify admin blocking and stale selection rejection on the deployed app without creating unsolicited real notifications.

If the application is rolled back, retain the additive enforcement/table and existing blocks. Removing database enforcement while old booking code is active would reintroduce the original problem. Provide a specific rollback procedure if migration changes need reversal; do not suggest dropping block data as a generic rollback.

If committing, follow `commit-patterns.md`: task-scoped staging, short explicit commit messages, and the required executable SQL/manual-step body when a database step truly remains for the user. Do not commit/push/deploy merely because this planning document exists.

Definition of done:

- Final writes reject past, less-than-30-minute, blocked, and occupied slots across create and reschedule.
- Database races cannot produce double bookings or a booking over a block.
- Stale forms recover with a precise localized reason, current availability, preserved user input, and explicit reconfirmation.
- Allowlisted admins can block/unblock a concrete range in a few interactions using the specified existing UI.
- Full date/time conversion works across zones, day boundaries and DST.
- Existing bookings, reminders, rate limits, admin tabs and the public visual design keep their intended behavior.
- SQL rollout requirements and actual test evidence are explicit; nothing is described as deployed unless verified.

## 12. Suggested prompt for the next chat

> Implement `dev_readme-appointment-availability-plan.md` in `/home/kali/Documents/GitHub/14_portfolio`. The plan covers the screenshots in `/home/kali/Pictures/TODO December/14`, a server-enforced 30-minute booking minimum, concurrent booking/block protection, stale-slot recovery, and simple admin block/unblock controls using the existing gray 3D small-dot UI. Follow the ordered checklist, preserve existing form data and bookings, and run the verification matrix. Re-check the current repository state. Finish the local implementation and exact SQL handoff; report any external deployment steps separately. Do not send real Telegram messages or deploy production as part of local testing.
