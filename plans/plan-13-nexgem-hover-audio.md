# plan-13 — nexgem hover audio routing + centre pulse

Back to [plan-00-tracker.md](plan-00-tracker.md). Branch `ui/crazy-mechanics`. Status: `approved` — every decision is
settled and the audio pool is final. This sheet is self-contained; hand it to a fresh session as-is.

Surface: the nexgem project card preview on `/` (Work tab, second card, below NDA).

---

## 1. Files this touches

| File | Role |
| --- | --- |
| [app/components/Projects/NexgemProjectPreview.tsx](../app/components/Projects/NexgemProjectPreview.tsx) | The whole widget — 5 SVG nodes, edges, hover audio |
| [app/globals.css](../app/globals.css) | `.nexgem-*` keyframes, the `body.modal-open` pause list, the `prefers-reduced-motion` list |
| `public/req-*.mp3`, `public/resp-*.mp3` | The clips (inventory in §3) |

Nothing else changes. The modal, card, locales, and tracked-project data stay as they are.

---

## 2. What is already built (do not re-derive this)

The preview draws five nodes on a dotted automation canvas, in a fixed layout inside `viewBox="0 0 600 430"`:

| Node | SVG transform | Role | Position |
| --- | --- | --- | --- |
| Secure auth (shield) | `translate(28 28)` | outer | top-left |
| Copy-paste sheets | `translate(28 152)` | outer | bottom-left |
| **n8n hub** | `translate(244 90)` | **centre** | middle |
| Chatbot bubble | `translate(460 28)` | outer | top-right |
| Website widget | `translate(460 152)` | outer | bottom-right |

Each node is rendered by the local `NexgemNode` component: shell rect, rim, pulse ring, two connector ports, then the
icon, then **one `fill="transparent"` hit rect covering `x=-4 y=-4 w=120 h=88`** which owns `onMouseEnter` /
`onMouseLeave`.

> That single hit rect matters. The node's own shapes leave a ~4px gap between the shell and the pulse ring, and pointer
> crossings over that gap produce a spurious leave → enter → leave burst. Keep all pointer handlers on the hit rect
> alone. Do not move them back onto the `<g>`.

Existing animation classes in `globals.css`, all registered in both the `body.modal-open` pause list and the
`prefers-reduced-motion` list:

- `.nexgem-flow` — the orange dash travelling along each of the four edges, 4.4s linear loop
- `.nexgem-node-pulse` — a slow rim glow on every node
- `.nexgem-hub-breath` — the radial glow behind the centre
- `.nexgem-typing-dot` / `.nexgem-reply-line` — the widget node's typing dot and three reply lines

**The orange edge dashes (`.nexgem-flow`) stay exactly as they are.** They already loop continuously on all four edges.
This plan does not make them directional, does not tie them to hover, and does not re-time them.

### Current audio behaviour — this is what gets replaced

All five nodes share one `handleNodeEnter` / `handleNodeLeave` pair, with module state in refs:

- enter on **any** node → plays `req-{pair}`
- leave from **any** node → plays `resp-{pair}`
- `isSoundingRef` — one sound at a time, extra hovers are dropped
- `isResponseOwedRef` — a request blocks the next request until its response has been heard
- `nextPairRef` — cycles pairs 1 → 2 → 3 → 1, advancing only when a response completes
- `isHoverSoundOn` — set in an effect from `(pointer: fine)` and `prefers-reduced-motion`; the `<audio>` elements only
  render when true, so touch devices never fetch the clips
- volume `0.35`, autoplay rejection swallowed silently

---

## 3. Audio inventory — measured, not guessed

Durations from `ffprobe`; "audible until" is the last `silencedetect` onset at `-40dB / d=0.25`, i.e. where real sound
ends and the silent tail begins.

### Single-token clips

| File | Duration | Audible until | Silent tail |
| --- | --- | --- | --- |
| `req-1.mp3` | 2.184s | 1.810s | 0.37s |
| `req-2.mp3` | 2.304s | 1.502s | 0.80s |
| `req-3.mp3` | 2.184s | (full) | ~0 |
| `req-4.mp3` | 2.136s | 1.395s | 0.74s |
| `req-5.mp3` | 2.184s | 1.791s | 0.39s |
| `req-6.mp3` | 2.088s | 1.484s | 0.60s |
| `resp-1.mp3` | 2.736s | 2.093s | 0.64s |
| `resp-2.mp3` | 4.176s | 0.863s | **3.31s** |
| `resp-3.mp3` | 4.464s | 3.594s | 0.87s |
| `resp-4.mp3` | 4.272s | 0.784s | **3.49s** |
| `resp-5.mp3` | 4.320s | 2.437s | 1.88s |
| `resp-6.mp3` | 4.272s | 1.312s | 2.96s |

Singles total ≈ 311KB (req 108KB + resp 204KB).

### Composite clips — the filename is the pulse script

**Grammar (confirmed by Nikita, and checked against the audio): one hyphen = 1000ms.**

Split the stem on runs of hyphens. Each `req` / `resp` word is a pulse on the centre node; each run of hyphens is the
gap before the next one, at 1000ms per hyphen. The trailing number is the ladder index, not a token.

```
req--resp--req-8
 ↑  ↑↑  ↑  ↑↑  ↑
 |  2000ms  2000ms
 pulse-in   pulse-out   pulse-in
```

The base separator differs per take and that is fine — the same parser reads both rhythms. Takes 6/8/9/9 use `--`
(2000ms) as their base beat; takes 10–13 use `-` (1000ms) with `--`/`---` for the longer rests.

**Verification that the grammar is real, not assumed.** `silencedetect` at `-40dB / d=0.08` on `req--resp--req-8.mp3`
groups the audio into three events with onsets at **0s, 2.153s, 4.302s** — spacing of ~2150ms where the name says `--`.
That is within 8% of the stated 1000ms-per-hyphen, so a pulse timeline driven off the filename reads as in sync with the
recording. Treat **the filename as the clock** and let the mp3 play underneath; do not try to recover onsets at runtime,
because the beeps have long decay tails and `silencedetect` returns inconsistent boundaries across the other takes.

Composites total ≈ 965KB. The whole pool (singles + composites) is ≈1.27MB — see §5 Step 2 for the preload note.

**File hygiene is done.** Nikita renumbered the pool to a clean 1–14, removed the literal space, and reworked the take
whose timeline overran its own recording. Every entry below now finishes its pulse timeline inside its own audio. No
renames are outstanding.

---

## 4. What Nikita asked for

1. `req*` clips play **only** on entering one of the **4 outer** icons.
2. `resp*` clips play **only** on entering the **centre** (n8n hub) icon.
3. A pulse animation lives **only on the centre icon**: `req` → **pulse-in**, `resp` → **pulse-out**.
4. Reference for the pulse feel — the existing online indicator, an `animate-ping` ring expanding and fading behind a
   solid dot.
5. The orange edge dashes stay untouched (§2).

---

## 5. Implementation steps

All decisions are settled (§6) — this section is ready to execute.

### Step 1 — split the hover handlers

`NexgemNode` currently takes one `onEnter` / `onLeave` pair for all five nodes. Give the four outer nodes
`handleOuterEnter` and the centre node `handleCentreEnter`. Keep both on the hit rect.

### Step 2 — rewrite the audio state machine

Replace the current pairing logic (`isResponseOwedRef`, `nextPairRef`) with the §7 playlist:

- a single `stepRef` into the 20-entry playlist, wrapping back to 0 after the last entry
- `isSoundingRef` — held for the clip's full `duration`, released on `ended`; while held, every hover is ignored
- each entry stores its group (`outer` / `centre`) and its pulse timeline, both parsed from the filename
- keep as-is: volume `0.35`, the `(pointer: fine)` gate, the reduced-motion gate, the autoplay-rejection swallow, and
  the unmount cleanup

Parse the filenames once at module scope rather than per hover — the playlist is static. Split each stem on `/(-+)/`,
treat every `req`/`resp` word as a pulse and every hyphen run as `run.length * 1000` ms of gap, and discard the trailing
number.

**Fetching strategy.** The pool is ≈1.27MB across 20 files. Setting every `<audio>` element's fetch hint to `auto` pulls
all of that up front for a decorative flourish, and steps 13–20 stay out of reach until a visitor has worked through
twelve hovers. Prefer `auto` on the first few entries and `none` on the long composites so the big files are fetched on
demand — the guard gives a late clip the whole of the preceding clip's duration to arrive.

### Step 3 — centre pulse CSS

Add to `globals.css`, next to the other `.nexgem-*` rules:

- `@keyframes nexgem-pulse-out` — ring starts at the node's own size at full opacity, scales up and fades to 0. This is
  the `animate-ping` shape.
- `@keyframes nexgem-pulse-in` — the mirror: ring starts wide and transparent, contracts to the node's size while fading
  up, then lands. Reversing `pulse-out` with `animation-direction: reverse` gives this for free and guarantees the two
  read as opposites.

Register both classes in the `body.modal-open` pause list **and** the `prefers-reduced-motion` list, same as every other
`.nexgem-*` class. This is required, not optional — every animation in this file is in both lists.

The ring element belongs inside the centre node's `<g>`, drawn **below** the hit rect so it never intercepts pointer
events, and `transform-box: fill-box; transform-origin: center` so it scales about the node's own centre rather than the
SVG origin.

### Step 4 — fire the pulse

Outer enter → play a `req` clip → start `pulse-in` on the centre node.
Centre enter → play a `resp` clip → start `pulse-out` on the centre node.

Restart the CSS animation by bumping a React `key` on the ring group (the same trick the widget reply sequence already
uses — `key={replyRun}`). Re-adding a class does not restart an animation; remounting does.

### Step 5 — verification

Static: `pnpm lint`, `npx tsc --noEmit`, `git diff --check`.

Runtime, on `http://localhost:3014` with the dev server that is already running (reuse it; do not start a second one on
port 3014). Chrome blocks audio until the page has a real user gesture, and `mouseenter` does not count as one — click
anywhere on the page first, or every clip is silently blocked.

Instrument playback rather than trusting ears:

```js
window.__log = []
const P = HTMLMediaElement.prototype.play
HTMLMediaElement.prototype.play = function () {
  const src = this.getAttribute("src")
  const t = Math.round(performance.now())
  const p = P.call(this)
  p.then(() => window.__log.push(`${t} PLAY ${src}`)).catch(() => window.__log.push(`${t} BLOCKED ${src}`))
  return p
}
```

Install it **once** — a second install double-wraps `play` and every entry appears twice.

Checks:

- [ ] the playlist walks steps 1 → 20 in order and then wraps to step 1
- [ ] a `req*` step only fires from one of the 4 outer icons; a `resp*` step only from the centre
- [ ] hovering the group that does not match the current step plays nothing and does not advance the counter
- [ ] leaving any icon plays nothing and interrupts nothing
- [ ] hovers during a clip are ignored, and the clip still plays to its full duration
- [ ] pulse offsets match the filename — check step 15 (`in@0, out@2000, in@6000, out@8000`) against wall-clock
- [ ] the centre ring runs pulse-in for req and pulse-out for resp, and the two are visibly opposite
- [ ] the orange edge dashes are unchanged
- [ ] no `<audio>` element renders under `(pointer: coarse)`
- [ ] every new class appears in the `modal-open` pause list and the reduced-motion list
- [ ] `document.body.scrollWidth === document.documentElement.clientWidth` at 390 / 624 / 1440

Commit message (12–40 chars, per [commit-patterns.md](../commit-patterns.md)): `feat: nexgem hover pulse`

---

## 6. Decisions — settled

- **D1 — travelling line: out of scope.** The orange edge dashes stay exactly as they are. This task is the hover audio
  routing plus the centre pulse, nothing else.
- **D2 — composites are in.** They are not decoration; each one is a scripted pulse sequence (§3).
- **D3 — timing: one hyphen = 1000ms.** Filename is the clock, verified against the audio (§3).
- **D5 — enter only.** Nothing plays on mouse leave. Which clip fires is decided by the icon group and by how far the
  visitor has climbed the ladder (§7).
- **D6 — pulse-in reads as "inside".** `req` → pulse-in, a ring contracting into the centre node. `resp` → pulse-out, a
  ring expanding away from it. One ring per pulse event, not a loop.

## 7. The playlist — one ordered call-and-response

There is **one global step counter**, not one per icon group. Each step names exactly one clip, and that clip's prefix
decides which icon group unlocks it:

- stem starts with `req` → any of the **4 outer** icons
- stem starts with `resp` → the **centre** icon

Hovering the group that does not match the current step plays nothing and does not advance. So the visitor drives a
conversation by alternating: hover an outer icon to send `req-1`, hover the centre to hear `resp-1`, back out for
`req-2`, and so on. **After the last step the counter starts over at step 1.**

`in` = pulse-in (ring contracting into the centre node), `out` = pulse-out (ring expanding away from it). Offsets are
parsed from the filename at 1000ms per hyphen.

| Step | File | Hover group | Pulse timeline (ms) | Duration |
| --- | --- | --- | --- | --- |
| 1 | `req-1.mp3` | outer | in@0 | 2.184s |
| 2 | `resp-1.mp3` | centre | out@0 | 2.736s |
| 3 | `req-2.mp3` | outer | in@0 | 2.304s |
| 4 | `resp-2.mp3` | centre | out@0 | 4.176s |
| 5 | `req-3.mp3` | outer | in@0 | 2.184s |
| 6 | `resp-3.mp3` | centre | out@0 | 4.464s |
| 7 | `req-4.mp3` | outer | in@0 | 2.136s |
| 8 | `resp-4.mp3` | centre | out@0 | 4.272s |
| 9 | `req-5.mp3` | outer | in@0 | 2.184s |
| 10 | `resp-5.mp3` | centre | out@0 | 4.320s |
| 11 | `req-6.mp3` | outer | in@0 | 2.088s |
| 12 | `resp-6.mp3` | centre | out@0 | 4.272s |
| 13 | `req--resp-7.mp3` | outer | in@0, out@2000 | 6.504s |
| 14 | `req--resp--req-8.mp3` | outer | in@0, out@2000, in@4000 | 6.480s |
| 15 | `req--resp----req--resp-9.mp3` | outer | in@0, out@2000, in@6000, out@8000 | 12.720s |
| 16 | `req--resp----req--resp--req-10.mp3` | outer | …plus in@10000 | 12.864s |
| 17 | `req-resp-resp-resp---resp-req-resp-resp-resp--resp-11.mp3` | outer | in@0; out@1000,2000,3000,6000; in@7000; out@8000,9000,10000,12000 | 12.936s |
| 18 | `req-resp-resp-resp--resp-req-resp-resp-resp--resp-12.mp3` | outer | in@0; out@1000,2000,3000,5000; in@6000; out@7000,8000,9000,11000 | 12.888s |
| 19 | `req-resp-resp-resp--resp-req-resp-resp-resp--resp-13.mp3` | outer | same shape as step 18 | 13.008s |
| 20 | `req-resp-resp-resp--resp-req-resp-resp-resp-resp-14.mp3` | outer | in@0; out@1000,2000,3000,5000; in@6000; out@7000,8000,9000,10000 | 12.528s |

Every timeline finishes inside its own recording — the longest, step 17, places its last pulse at 12000ms in a 12.936s
clip.

### The playback guard — never interrupt

While a clip is sounding, **every hover is ignored and nothing is queued**. The current clip always plays to its full
duration, whether or not the pointer stays on the icon, and whether or not other icons get hovered meanwhile. The
counter advances and the next clip becomes available only once the current one has ended.

Concretely: the same `isSoundingRef` guard that exists today, held for the clip's whole `duration` (not its audible
end), released on `ended`. Pointer leave has no effect on playback at all.

### Two consequences worth knowing

1. **From step 13 onward the centre icon goes quiet.** Steps 13–20 all start with `req`, so only the outer icons advance
   the playlist until it loops back to step 1. That falls out of the pool's contents, not the design — the centre's pulse
   still fires throughout, because the composites' `resp` tokens animate it.
2. **Steps 15–20 hold the guard for 12–13 seconds.** During that window the widget is deliberately unresponsive to
   hover. That is the requested behaviour, but it also means `resp-2` and `resp-4` (4.2s long, audible for under 0.9s)
   hold the guard through ~3.4s of silence. Trimming those two tails would tighten the early steps at no cost to the
   design — worth doing, not a blocker.
