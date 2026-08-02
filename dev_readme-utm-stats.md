# UTM stats — the 4 identity layers

### Why this exists

Every visit is attributed to one `deviceId`, and `utm_stats.user_id` is that id. One person visiting twice
must produce one row, not two — otherwise "500 visits" means nothing.

The hard part is that the browser is free to forget. A visitor clears site data, opens a private window,
switches from Chrome to Firefox on the same machine, or comes back after the cookie expired. Each of those
wipes a different subset of what identifies them, so **one** storage mechanism is never enough.

So identity is resolved through 4 layers, tried in order, each one surviving a failure the one above it does
not. The first layer that answers wins and the rest are skipped.

| Layer | Where it lives                     | Survives                        | Lost when                         |
| ----- | ---------------------------------- | ------------------------------- | --------------------------------- |
| 1     | localStorage (`deviceIdStore`)     | cookie expiry, IP change        | site data cleared, private window |
| 2     | httpOnly cookie (`14_did`)         | localStorage cleared by page JS | end of day, site data cleared     |
| 3     | Redis, keyed by IP                 | all browser storage cleared     | IP changes, next day              |
| 4     | Redis, keyed by device fingerprint | a switch to a different browser | 10 minutes, different machine     |

### Where the data lives

```
  BROWSER                                    SERVER (trackVisitAction)          REDIS / DB
  ─────────────────────────────────────      ────────────────────────────       ────────────────────────────────

  layer 1  localStorage "deviceIdStore"  ──► clientDeviceId ─┐
           { deviceId: "14-<nanoid>" }                       │
                                                             ├─ resolveDeviceIdFromStorageAndIp
  layer 2  cookie "14_did"  (httpOnly)  ───► decryptDeviceId ─┤
           aes-256-gcm(deviceId)                             │
                                                             └─► redis.get ──► utm:device-id:by-ip:<ip>
  layer 3  request IP  (x-real-ip)  ──────► getRequestIp ───────────────────────  exat = end of day

           ── all three missed → server replies { needsFingerprint: true } ──

  layer 4  computeFingerprint()  ─────────► resolveDeviceIdFromFingerprint
           sha256 of machine signals              └─► redis.get ──────────────► utm:device-id:by-fingerprint:<sha256>
                                                                                 ex = 600 (10 min)
           still nothing → `14-${nanoid()}`

                                            syncDeviceIdLayers writes all of them back
                                            + one utm_stats row per deviceId per day
```

| File                                        | Owns                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| `app/store/useDeviceIdStore.ts`             | layer 1 — the persisted `deviceId`                         |
| `app/libs/deviceId.ts`                      | minting a signed `deviceId` and verifying one              |
| `app/libs/deviceIdCookie.ts`                | layer 2 — encrypt/decrypt, cookie name, end-of-day expiry  |
| `app/utm-stats/computeFingerprint.ts`       | layer 4 — the signal list and the sha256                   |
| `app/utm-stats/actions/trackVisitAction.ts` | resolve order, write-back, the daily dedup, the row insert |
| `app/utm-stats/UTMTracker.tsx`              | the two-phase call and the URL cleanup                     |
| `app/classes/RedisKey/RedisKey.ts`          | the two Redis key shapes                                   |

### Terminology

| Term             | Means                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| `deviceId`       | `14-<body>-<check>`. The identity itself, signed — see "The deviceId itself".        |
| `clientDeviceId` | what layer 1 sent this request. `null` when localStorage had nothing.                |
| `fingerprint`    | sha256 of machine signals. `null` = not computed yet, `""` = computed and empty.     |
| trustworthy IP   | a parseable public address — not loopback, not a private range. See below.           |
| write-back       | `syncDeviceIdLayers` — after resolving, every layer is re-pointed at the winning id. |

### The deviceId itself

```
  14-Xk29vBq7mTz4LpR8nWc1s-7QF3KMBH
  ^^ ^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^
  |  body: 21 chars of      check: 8 chars of Crockford base32,
  |  [0-9a-zA-Z]            each one a byte of HMAC-SHA256(key, body) mod 32
  prefix
```

Layer 1 is the only layer a visitor owns outright — a localStorage value their own devtools can
edit — and the server used to accept whatever it sent as the `user_id` on a `utm_stats` row. Typing
`14-whatever` into localStorage was enough to invent visitors or write rows under someone else's id.

The check closes that. Deriving it from the body takes one HMAC **with the signing key**; without the
key the only route is trying all 32⁸ combinations. `isValidDeviceId` re-derives the check from the
body it was handed and compares with `timingSafeEqual`, so a hand-typed id is rejected and the visit
falls through to layers 2–4 as though localStorage had been empty.

The signing key is derived from `DEVICE_ID_ENCRYPTION_KEY` through its own HMAC rather than being a
second env var, so the encrypting use and the signing use never share raw key material.

Every deviceId is checked, not only layer 1's — the cookie and Redis values pass by construction,
and running them through as well is what retires the older unsigned `14-<nanoid>` ids instead of
letting them stay valid forever.

**This is a keyed check, not a character substitution table.** A fixed table would be readable off a
handful of real ids, and every visitor holds one of those in their own localStorage.

### Layer 1 — localStorage

`useDeviceIdStore`, a zustand store with `persist`. The localStorage key is `deviceIdStore` (the store creator
function's own name — enforced by the `zustand-persist-name` eslint rule).

`UTMTracker` reads it with `.getState()` and sends it as the first argument of `trackVisitAction`. If the server
resolves a different id, the store is updated so the next visit hits layer 1 again.

This is the only layer the browser itself owns, and the only one that survives across days without a server
round trip agreeing to it.

### Layer 2 — cookie

`14_did`, set by the server, never read by page JS:

- `httpOnly` — page JS has no access, so a script clearing localStorage leaves this intact
- `sameSite: "lax"`, `secure` in production
- value is `aes-256-gcm` over the deviceId, packed as `iv | authTag | ciphertext` in base64url
- key comes from `DEVICE_ID_ENCRYPTION_KEY` (32-byte hex, 64 chars) and the module throws at import if unset
- expires at **end of day in the visitor's own timezone**, not 24h from now — so it ends at the same moment the
  daily dedup window does

Encrypted rather than stored as the readable id, because the cookie is the one layer a visitor can pull off
their own machine and hand-edit. `decryptDeviceId` returns null on a bad auth tag, so a tampered cookie falls
through to layer 3 and the edited value never reaches `utm_stats`.

### Layer 3 — IP

Redis `utm:device-id:by-ip:<ip>` → deviceId, expiring at end of day in the visitor's timezone.

Reached when both browser layers are empty — a visitor who cleared site data, or opened a private window. It is
also what catches the browser-switch case in production, since both browsers send the same IP.

The address has to earn its way into a key. `getRequestIp` reads `x-real-ip` then `x-forwarded-for`, both of
which arrive with the request, so `isTrustworthyIp` rejects anything `net.isIP` will not parse — otherwise a
hand-written `x-forwarded-for: pick-me` becomes a key any number of people could aim at. Loopback and the
private ranges (`10.`, `192.168.`, `172.16–31.`, `169.254.`, `fc00::/7`, `fe80::`) are rejected too: everyone
behind one router shares them, so they name a household rather than a visitor.

**This layer is a heuristic, not proof.** Two people behind the same NAT / CGNAT / office wifi can receive the
same deviceId if one clears storage right after the other visited. Accepted deliberately: over-merging two
visitors into one row is a smaller error than counting one visitor as a new person every day.

### Layer 4 — fingerprint

Redis `utm:device-id:by-fingerprint:<sha256>` → deviceId, TTL **600s**.

The hash covers machine/OS/display signals only:

```
  screen.width x screen.height x screen.colorDepth
  Intl timezone
  navigator.language + navigator.languages
  navigator.hardwareConcurrency
  navigator.deviceMemory
  WEBGL_debug_renderer_info → UNMASKED_RENDERER_WEBGL
  canvas render hash (a fixed string drawn to a 220x30 canvas, toDataURL)
  navigator.platform
```

**No `navigator.userAgent`, deliberately.** This layer exists specifically to survive a visitor switching
browsers on the same machine — including a browser-level signal would change the hash the moment the browser
changes and defeat the one case it is for.

It is the last resort and it is the only layer that is not sent on every visit. See the flow below.

The value has to match `^[0-9a-f]{64}$` before it becomes a key. `computeFingerprint` only ever returns a
sha256 hex digest, but the value reaches the server as an action argument, so without the shape check a caller
could send a megabyte of text and have it written to Redis as a key.

### The two-phase request

The browser has no way to tell whether layers 2 and 3 hit: the cookie is `httpOnly` and the IP mapping is in
Redis. So the server asks for the fingerprint only when it needs one.

```
  visit
    │
    ├─ 1. trackVisitAction(deviceId, params, url, timezone)     ← fingerprint arg omitted → null
    │        │
    │        ├─ layer 1/2/3 hit ──► { deviceId }  ────────────► done, one round trip
    │        │
    │        └─ all missed ──────► { needsFingerprint: true }
    │                                     │
    └─ 2. computeFingerprint()  ◄──────────┘     canvas + WebGL reads happen ONLY here
              │  .catch(() => "")
              │
              └─ trackVisitAction(..., fingerprint)   ← "" means tried and empty
                       │
                       ├─ layer 4 hit ──► { deviceId }
                       └─ layer 4 miss ─► deviceId = `14-${nanoid()}`
```

The `null` vs `""` distinction on the `fingerprint` parameter is what ends the exchange: `null` means "not
computed yet, ask me", `""` means "computed and the browser gave nothing", so the server mints a new id instead
of asking a second time.

`TrackVisitResult` is written out as `{ needsFingerprint: true } | { deviceId: string }` rather than inferred —
an inferred union gives the first shape an optional `deviceId?: undefined` and `"deviceId" in result` then tells
the client nothing about which shape it actually got.

### Write-back and dedup

Once an id is resolved, `syncDeviceIdLayers` re-points every layer at it:

- IP key → deviceId, `exat` end of day (skipped for an untrustworthy IP)
- fingerprint key → deviceId, `ex` 600 (skipped when no fingerprint was sent — i.e. on every hit path)
- cookie re-set, but only when the existing one decrypts to a different id

Then one row per deviceId per day: `utm_stats` is queried for a row with this `user_id` created today, and the
insert is skipped if one exists. Missing UTM params default to `source: "organic"`, `medium: "direct"`.
Finally `UTMTracker` strips the query string with `history.replaceState` so a refresh does not re-attribute.

### Decisions made AGAINST

- **Against sending the fingerprint on every visit.** Canvas and WebGL reads cost real time on the main thread,
  and a returning visitor resolves on layer 1 without the value ever being read. It is now computed only on the
  `needsFingerprint` path.

  Known consequence: the fingerprint key used to be rewritten on every visit, which kept it alive indefinitely.
  It is now written only on the miss path, so it expires 10 minutes after the last visitor who actually needed
  it. In production the IP layer covers the browser-switch case, so layer 4 is genuinely a last resort.

- **Against keeping the fingerprint in localStorage.** It previously lived in a `useFingerprintStore` with a
  10-minute freshness stamp. That store is deleted — the fingerprint → deviceId mapping belongs in Redis alone,
  since the browser never reads it back for anything.

- **Against trusting `127.0.0.1` / `::1` as a key.** A VPS `next start` with no reverse proxy in front of it
  never sets `x-real-ip` / `x-forwarded-for`, so `getRequestIp` returns the same literal string for everyone.
  Keying Redis on it would hand every storage-wiped visitor whichever stranger's deviceId last wrote there.

- **Against a day-long TTL on the fingerprint mapping.** A fingerprint match is a probability — a different
  browser on similar hardware tells the server nothing definite. 10 minutes means a coincidental match can only
  bridge one short session rather than claim someone else's deviceId for the rest of the day. The IP and cookie
  layers get the day-long expiry because they are stronger evidence.

- **Against `navigator.userAgent` among the signals.** See layer 4 — it would break the exact case the layer is for.

- **Against an unencrypted cookie.** It is the one layer the visitor can hand-edit; the auth tag makes a tampered
  value fall through instead of being trusted.

- **Against a bare `14-<nanoid>` id.** The random part alone proves nothing about where the id came from, and
  layer 1 hands the server whatever localStorage holds. The check is what makes the id say "this server minted
  me". Cost of the change: every id already in a visitor's localStorage fails the check once, so returning
  visitors are re-identified through layers 2–4 or given a new id.

- **Against a fixed character mapping.** The obvious cheap version of the same idea — map each body character
  to a check character through a lookup table — is readable off a handful of real ids, and every visitor holds
  one in their own localStorage. Only a keyed derivation keeps working after someone has seen valid examples.

- **Against letting one edited argument end the visit.** `timezone`, `fingerprint` and the IP headers all reach
  the server action from the browser. An unknown timezone threw a `RangeError` out of `Intl` before any row was
  written; it now falls back to 24h from now. The other two are shape-checked before becoming Redis keys.

### Reproduction steps

```
  A. returning visitor
     localStorage has deviceId ──► layer 1 ──► 1 round trip, no fingerprint computed
     utm_stats: no new row if one already exists for today

  B. cleared site data, same IP, same day
     layer 1 miss (localStorage gone)
     layer 2 miss (cookie gone)
     layer 3 HIT  (utm:device-id:by-ip:<ip> still set until end of day)
     ──► same deviceId, still 1 round trip, no fingerprint computed

  C. switched Chrome → Firefox, same machine, IP untrustworthy (local dev)
     layer 1 miss, layer 2 miss, layer 3 skipped (127.0.0.1)
     ──► { needsFingerprint: true }
     ──► computeFingerprint() ──► layer 4 HIT if Chrome's visit went through this same path
                                  within the last 10 min, else a NEW deviceId

  D. brand new visitor
     all 4 miss ──► deviceId = createDeviceId()  →  14-<body>-<check>
     ──► written to all layers, 1 utm_stats row inserted

  E. localStorage hand-edited to "14-mine"
     layer 1 REJECTED by isValidDeviceId (no check, wrong shape)
     ──► resolves through layers 2-4 exactly as in B/C/D
     ──► utm_stats never sees the typed value, and the real id is written back over it
```
