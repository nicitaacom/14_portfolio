# plan-02 — WORKBENCH wall: bricks + violet neon behind every page (build sheet)

**This sheet is self-contained — execute it in a fresh session without any other context.**
Status lives in [plan-00-tracker.md](plan-00-tracker.md) only.
Every "Current" block below was read from disk on 2026-07-28 — verify each anchor with the pre-flight greps in §3.0 before editing; if one misses, STOP and report instead of guessing.

## How to run this sheet (binding)

- Repo: `/home/kali/Documents/GitHub/14_portfolio` — every path below is relative to it
- Branch: `git checkout ui/crazy-mechanics` — it exists, all work lands there. Never touch `production`
- Read before touching code: [dev_readme-it-worked-ui.md](../dev_readme-it-worked-ui.md) §3.1 (one light) + §3.5 (motion contract), and [app/components/Projects/NDAProjectPreview.tsx](../app/components/Projects/NDAProjectPreview.tsx) — its brick pattern (`nda-lit-bricks`), mask trick and hex values are the source this task copies
- Reference shots (open both): [crazy-mechanics-loading.jpg](../public/UI/crazy-mechanics-loading.jpg) — black room, one lit brick wall — and [crazy-mechanics-main.jpg](../public/UI/crazy-mechanics-main.jpg) — workbench wall, soft top light
- Never run the dev server, never `pnpm dev`, never a browser. Nikita runs it
- Execute steps 3.1 → 3.5 in order, run §6 verification, show the FULL diff, then STOP and wait
- Commit only after Nikita writes approval, locally only: `feat: workbench wall` — then hand him `git push -u origin ui/crazy-mechanics`. `git push` is denied for you
- A pre-write hook (`no-banned-words.js`) blocks lazy words in any file — code comments and class names included. If a write bounces, rename the flagged word; never bypass the hook
- Replies to Nikita: bold labels, one fact per line, `-` bullets, real file paths, lines under 350 chars, no prose walls

## Locked decisions — never re-open, never "improve"

- "Neon" means the violet `--cta` lamp glow — never a colored tube graphic, never a second hue
- Materials are drawn: CSS gradients / SVG patterns. Zero raster files, zero `url()` assets, zero new images
- One lamp page-wide: light pool top-center, shadows straight down
- The NDA preview keeps its own swinging lamp — a framed exhibit INSIDE the page. The page wall does NOT swing; it flickers in place. Two swinging lights would disagree (vibes doc: against per-component light direction)
- Loop periods already taken: 5 / 5.8 / 7 / 8 / 9 / 10.5 / 12s (seed + task 01 rail + task 01's status pulse). This task adds exactly ONE loop at **6.3s**
- Every loop pauses on `body.modal-open` and turns off under `prefers-reduced-motion`
- Scope: the background layer + mounting it. Project.tsx, HomePageView, modals, admin files keep their surfaces — each becomes a panel in its own later task

## 0. Why

Every page still sits on a flat `#212121` fill — the workshop parts (navbar plate, NDA lamp) hang in a void that says "css page", not "room". The game's rooms are black with one brick wall caught by the light. Giving every page that wall makes each later panel task land on a stage, and Project cards immediately read as things screwed to a wall.

## 1. Current state — verified anchors

- [app/globals.css:5-24](../app/globals.css) — `:root` token block; material tokens from task 01 already end it:

```css
  --steel: 276deg 10% 22%; /* #38323F — panel face, from the seed */
  --steel-deep: 270deg 21% 9%; /* #17131D — panel shadow side, from the seed */
  --wood: 28deg 25% 22%;
  --brass: 40deg 45% 55%;
  --paper: 38deg 40% 88%;
  --blueprint: 210deg 25% 30%;
}
```

- [app/globals.css:300-310](../app/globals.css) — the page base this task retints (the `background-color` at line 308):

```css
html,
body,
:root {
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: hsl(var(--primary));
  min-height: -webkit-fill-available;
}
```

⚠ Two MORE `background-color: hsl(var(--primary))` lines exist at ~484 and ~502 — they belong to `.rdr*` calendar classes. Touch ONLY the one inside the `html, body, :root` block.

- [app/globals.css:451-459](../app/globals.css) — the pause group (one comma list, one rule):

```css
body.modal-open .nda-lamp-swing,
body.modal-open .nda-lamp-glow,
body.modal-open .nda-lamp-beam,
body.modal-open .nda-lamp-email-icon,
body.modal-open .nda-lamp-panel-progress,
body.modal-open .hazard-rail,
body.modal-open .navbar-status-light {
  animation-play-state: paused;
}
```

- [app/globals.css:461-469](../app/globals.css) — the reduced-motion list (same seven classes, `animation: none`)
- [app/[locale]/layout.tsx](../app/[locale]/layout.tsx) — the mount point, current return:

```tsx
return (
  <I18nProviderClient locale={locale}>
    <div className={`${inter.variable} ${specialElite.variable}`}>
      <Navbar />
      <UTMTracker userId={`14-${nanoid()}`} />
      <Layout>{children}</Layout>
    </div>
  </I18nProviderClient>
)
```

- [app/components/Layout.tsx:23-25](../app/components/Layout.tsx) — content shell; `bg-background text-title` match zero tokens in [tailwind.config.ts](../tailwind.config.ts) (no `background`, no `title` color exists), so both classes emit no CSS
- [app/[locale]/not-found.tsx](../app/[locale]/not-found.tsx) — a route segment under `[locale]/layout.tsx`, so it inherits the wall automatically. Zero edits there
- [tailwind.config.ts:32-51](../tailwind.config.ts) — `extend.colors` currently ends with `blueprint: "hsl(var(--blueprint) / 1)"`
- [app/components/Project/Project.tsx:42-46](../app/components/Project/Project.tsx) — cards are bordered boxes on transparent surroundings; the wall will show around them with zero edits

## 2. Target — the parts

```
        ╍╍╍╍╍╍╍╍╍ navbar plate + hazard rail (task 01, untouched) ╍╍╍╍╍╍╍╍╍
   ┌─────────────────────────────────────────────────────────────────────┐
   │            ░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░                         │ ← violet pool, top-center,
   │        ░░ ┬──┬──┬──┬──┬──┬──┬──┬──┬──┬ ░░                          │   flickers at 6.3s
   │           ┴──┴──┴──┴──┴──┴──┴──┴──┴──┴                             │ ← bricks visible inside the
   │      ┌────────────┐        ┌────────────┐                          │   pool, fading out of it
   │      │ Project    │        │ Project    │   content flows on top   │
   │      └────────────┘        └────────────┘                          │
   │   darkness at the edges — vignette, room falls to near-black       │
   └─────────────────────────────────────────────────────────────────────┘
```

One fixed layer behind every route: room base → bricks masked by the light pool → violet pool glow → corner vignette. Content scrolls; the wall holds still.

## 3. Steps — exact edits, in this order

### 3.0 Pre-flight (run first; any miss → STOP and report)

```bash
cd /home/kali/Documents/GitHub/14_portfolio && git branch --show-current
```

```bash
grep -n "blueprint: 210deg" app/globals.css && grep -n "background-color: hsl(var(--primary))" app/globals.css && grep -n "body.modal-open .navbar-status-light" app/globals.css && grep -rn "WorkbenchWall" app && echo CLEAR || echo CHECK-OUTPUT
```

Expected: branch `ui/crazy-mechanics`; one blueprint hit ~line 23; three background-color hits (~308, ~484, ~502); one pause-group hit; zero WorkbenchWall hits.

### 3.1 Room token + page base

**[app/globals.css](../app/globals.css)** — inside `:root`, directly after the `--blueprint` line:

```css
  --room: 260deg 33% 4%; /* the black room behind every page; the NDA scene keeps its own darker #09070d */
```

Same file, the `html, body, :root` block ONLY (line ~308):

```css
  background-color: hsl(var(--primary));
```

→

```css
  background-color: hsl(var(--room));
```

`--primary` itself stays untouched — panels, calendars, modals read it as a SURFACE color. The two calendar `background-color` lines at ~484/~502 stay exactly as they are.

**[tailwind.config.ts](../tailwind.config.ts)** — in `extend.colors`, directly after the `blueprint` line:

```ts
        room: "hsl(var(--room) / 1)",
```

### 3.2 The wall component — new file, exact content

New file `app/components/WorkbenchWall.tsx` — server component: no `"use client"`, no props, no hooks. Type it exactly as below; every number is a decision, not a suggestion:

```tsx
export function WorkbenchWall() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" fill="none">
        <defs>
          <linearGradient id="wall-base" x1="720" y1="0" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0D0A12" />
            <stop offset="1" stopColor="#060409" />
          </linearGradient>
          <pattern id="wall-bricks" width="180" height="92" patternUnits="userSpaceOnUse">
            <path
              d="M0 0H180M0 46H180M0 92H180M90 0V46M45 46V92M135 46V92"
              stroke="white"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
            <rect x="91" y="1" width="88" height="44" fill="hsl(var(--cta))" fillOpacity="0.05" />
            <rect x="1" y="47" width="43" height="44" fill="hsl(var(--cta))" fillOpacity="0.03" />
          </pattern>
          <linearGradient id="wall-pool-fade" x1="720" y1="0" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.3" />
            <stop offset="0.8" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="wall-light-zone" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="900">
            <rect width="1440" height="900" fill="black" />
            <path d="M720 -80L60 900H1380L720 -80Z" fill="url(#wall-pool-fade)" />
          </mask>
          <radialGradient id="wall-pool" cx="0" cy="0" r="1" gradientTransform="translate(720 0) scale(820 620)">
            <stop stopColor="hsl(var(--cta))" stopOpacity="0.13" />
            <stop offset="0.55" stopColor="hsl(var(--cta))" stopOpacity="0.05" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wall-vignette" cx="0" cy="0" r="1" gradientTransform="translate(720 380) scale(980 720)">
            <stop stopColor="black" stopOpacity="0" />
            <stop offset="0.72" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#wall-base)" />
        <rect width="1440" height="900" fill="url(#wall-bricks)" mask="url(#wall-light-zone)" />
        <rect width="1440" height="900" fill="url(#wall-pool)" className="workbench-glow" />
        <rect width="1440" height="900" fill="url(#wall-vignette)" />
      </svg>
    </div>
  )
}
```

Why each layer (so nothing gets "fixed"):

- Rect order = the vibes doc §3.3 stack: base wall → bricks caught by light → the violet pool → the dark room closing in
- The mask means bricks exist ONLY where light falls — outside the pool the wall is a black room, exactly the loading shot
- `preserveAspectRatio="xMidYMin slice"` pins the pool to the top-center on every viewport; the SVG crops at the sides on tall/phone screens instead of stretching
- Brick geometry (180×92, offsets 45/90/135) is copied from `nda-lit-bricks` in the seed — same wall, different room
- `strokeOpacity 0.05` vs the seed's 0.01: the seed's bricks sit behind an extra beam layer; the wall has none, so mortar gets 0.05 to stay barely legible. NOT higher

### 3.3 The flicker loop

**[app/globals.css](../app/globals.css)** — next to the other `@keyframes` (~line 401, where `rail-crawl` lives):

```css
@keyframes wall-flicker {
  0%,
  100% {
    opacity: 1;
  }
  47% {
    opacity: 0.82;
  }
  52% {
    opacity: 0.9;
  }
  71% {
    opacity: 0.86;
  }
}
```

In the `@layer components` block (next to `.machine-face` / `.machine-slot`):

```css
  .workbench-glow {
    animation: wall-flicker 6.3s linear infinite;
  }
```

- Stepped keyframes + linear curve = electrical flicker, same idiom as `nda-lamp-flicker`. No ease curves — eased opacity reads as lungs, wrong machine
- **6.3s** — taken periods are 5 / 5.8 / 7 / 8 / 9 / 10.5 / 12; 6.3 drifts against all of them. (8.2 was the first pick; the 8s `navbar-status-pulse` from the task-01 build sits too close, so 6.3 it is)

### 3.4 Pause + reduced-motion (both mandatory)

**[app/globals.css:451-459](../app/globals.css)** — the pause group becomes (append ONE selector, keep the rest byte-identical):

```css
body.modal-open .nda-lamp-swing,
body.modal-open .nda-lamp-glow,
body.modal-open .nda-lamp-beam,
body.modal-open .nda-lamp-email-icon,
body.modal-open .nda-lamp-panel-progress,
body.modal-open .hazard-rail,
body.modal-open .navbar-status-light,
body.modal-open .workbench-glow {
  animation-play-state: paused;
}
```

**[app/globals.css:461-469](../app/globals.css)** — same move in the reduced-motion block: append `.workbench-glow` to the `animation: none` selector list. Reduced motion keeps the pool at full opacity — a static lit wall, nothing lost.

### 3.5 Mount + Layout sweep

**[app/[locale]/layout.tsx](../app/[locale]/layout.tsx)** — add the import next to the other `@/components` imports:

```tsx
import { WorkbenchWall } from "@/components/WorkbenchWall"
```

and make the wall the first child of the fonts div:

```tsx
    <div className={`${inter.variable} ${specialElite.variable}`}>
      <WorkbenchWall />
      <Navbar />
```

Everything else in the file — `force-dynamic`, `isLocale`, providers — stays byte-identical. `fixed -z-10` paints above the html/body fill but under all static-positioned content; no z-index edits anywhere else.

**[app/components/Layout.tsx:23-25](../app/components/Layout.tsx)** — current:

```tsx
    <div
      className="bg-background text-title
      min-h-[calc(100vh-72px)] overflow-x-hidden overflow-y-auto transition-colors duration-300 pt-[62px]">
```

→ delete the two no-op classes (they match zero tailwind tokens and now read as if something paints a background):

```tsx
    <div className="min-h-[calc(100vh-72px)] overflow-x-hidden overflow-y-auto transition-colors duration-300 pt-[62px]">
```

## 4. What this does to Project.tsx — zero edits, by design

- Cards ([Project.tsx:42-46](../app/components/Project/Project.tsx)) are bordered boxes on transparent surroundings — the wall shows around and between them
- Their iframe previews stay opaque (they show real sites) — a monitor screwed to a wall shows its own picture
- The panel treatment (screws, steel face, straight-down shadow) is task 04's sheet, not this one
- The NDA exhibit keeps its `#09070d` interior and its swinging lamp — still the only thing on the page that swings

## 5. Forbidden moves (drift guards)

- No scroll listener, no parallax, no mouse-tracking light — the wall is FIXED and holds still; motion budget is the one 6.3s flicker
- No swing animation anywhere in this task
- No edits to `--primary`, Project.tsx, HomePageView.tsx, NavbarWithProgress.tsx, any modal, any admin file, the calendar CSS
- No raster file, no `background-image: url(...)` — the pattern lives inline in the component
- No brightening beyond the given opacities "so the bricks show" — the wall is felt, not read; the loading shot keeps the room nearly black
- No new npm package, no barrel-file creation
- Every color = tokens + the two room hexes (`#0D0A12`, `#060409`) — nothing new
- If the pre-write hook bounces a word, rename the word — never bypass the hook

## 6. Verification before showing the diff

```bash
npx tsc --noEmit
```

```bash
grep -c "workbench-glow" app/globals.css
```

Expected: tsc silent; grep returns `3` (recipe + pause group + reduced-motion). Then `git diff` + `git status --short` — the touched set is EXACTLY: `app/globals.css`, `tailwind.config.ts`, `app/[locale]/layout.tsx`, `app/components/Layout.tsx`, new `app/components/WorkbenchWall.tsx`. Anything else in the diff = you drifted; revert it before showing.

## 7. Done checklist

- [ ] One fixed SVG layer behind every route (`/`, appointment, admin dashboard, 404 — all under `[locale]/layout.tsx`)
- [ ] Bricks visible only inside the top-center pool, room falls to near-black at the edges (compare the loading shot)
- [ ] Pool flickers at 6.3s in linear steps; paused under `body.modal-open`; static at full light under reduced motion
- [ ] Overscroll rubber-band shows the room color, not `#212121`
- [ ] `--primary` untouched — panels/calendar/modals render exactly as before on top
- [ ] Zero raster files, zero new deps, tsc green
- [ ] Wall never intercepts a click — a `fixed -z-10` div under content

## 8. What Nikita opens to check (he runs the server, never you)

- `/` — dark room, brick wall lit top-center in violet, projects and skills float on it
- Scroll — wall holds still, content slides over it, zero grey flashes
- Watch the pool ~7s — faint electrical flicker, out of sync with the rail crawl and the NDA lamp
- Open any modal → pool freezes with everything else
- `/appointment` + admin dashboard — same room behind them
- Phone width — pool centered, no horizontal scroll, no stretching
- Click a Project link — the wall never eats the click

## 9. After approval

- Commit locally: `feat: workbench wall`
- Hand over: `git push -u origin ui/crazy-mechanics`
- Update task 02 → `done` in [plan-00-tracker.md](plan-00-tracker.md) (the only status board)

---

## 10. Pattern fidelity — LAW, added after Nikita reviewed the built panels

Nikita approved the detail level of the task-01 builds (wood board with corner screws behind the skills, wood-grain "Portfolio" plank, sin-wave field under the repo strip) and set the rule: **that richness continues, and every material copies its `public/UI/` shot strictly — the shot is the spec, not an inspiration.**

### 10.1 The fidelity loop (run it for every material you draw)

1. Open the matching shot in `public/UI/` FIRST — for this task: [crazy-mechanics-loading.jpg](../public/UI/crazy-mechanics-loading.jpg)
2. Name what the game actually drew: bricks vary tone brick-by-brick; mortar is a dark cut with a lit lower lip (depth, not a line); the surface is mottled, never flat; edges of the room go truly black
3. Reproduce THOSE properties with drawn means — per-element tone steps, double-stroke mortar, turbulence grain
4. Compare your result to the shot side by side before showing the diff. Flat === wrong; a single-opacity grid reads as CSS, not as a wall

### 10.2 Brick upgrade — replaces the `wall-bricks` pattern inside §3.2, adds one filter + one rect

Everything else in §3.2 stays byte-identical. Swap ONLY the `<pattern id="wall-bricks">…</pattern>` block for:

```tsx
<pattern id="wall-bricks" width="180" height="92" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="88" height="44" fill="white" fillOpacity="0.015" />
  <rect x="91" y="1" width="88" height="44" fill="hsl(var(--cta))" fillOpacity="0.05" />
  <rect x="1" y="47" width="43" height="44" fill="hsl(var(--cta))" fillOpacity="0.03" />
  <rect x="46" y="47" width="88" height="44" fill="white" fillOpacity="0.025" />
  <rect x="137" y="47" width="43" height="44" fill="black" fillOpacity="0.07" />
  <path
    d="M0 0H180M0 46H180M0 92H180M90 0V46M45 46V92M135 46V92"
    stroke="black"
    strokeOpacity="0.35"
    strokeWidth="2"
  />
  <path d="M0 2H180M0 48H180M90 2V46M45 48V92M135 48V92" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
</pattern>
```

- Five bricks per tile at five different tones = the coursing of the loading shot; two of them violet because the lamp catches them
- Mortar = black 2px cut + white 1px one pixel lower — a groove lit from above, obeying the top-edge rule at brick scale

Add to `<defs>` (grain — the mottled plaster/rust of every game surface, drawn via turbulence, zero raster):

```tsx
<filter id="wall-grain" x="0" y="0" width="1440" height="900" filterUnits="userSpaceOnUse">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
  <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
  <feComposite operator="in" in2="SourceGraphic" />
</filter>
```

And ONE rect between the bricks rect and the pool rect in the body:

```tsx
<rect width="1440" height="900" fill="white" filter="url(#wall-grain)" mask="url(#wall-light-zone)" />
```

Result: faint white noise (max alpha 0.05) only where light falls — the wall stops being flat. Renders once; zero runtime cost after paint. §6 verification and the touched-file set stay unchanged.

### 10.3 Tool matrix — svg + canvas + framer-motion + gsap are all authorized, each in its lane

`framer-motion@12` and `gsap@3.12` are ALREADY in package.json; canvas is already used by the repo wavefield. "No new npm package" in §5 still holds — these three are installed, nothing else gets added.

| Tool          | Its lane                                                                                  | This task              |
| ------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| SVG           | Structure + materials: patterns, gradients, masks, turbulence grain                        | the whole wall         |
| canvas        | Continuous math-driven motion — sin/cos fields like the repo wavefield                     | not needed, wall holds still |
| framer-motion | Transitions the visitor causes: mount/unmount, press, hover spring                         | not needed here        |
| gsap          | Choreographed timelines: multi-step flicker sequences, the future lever gate travel        | not needed here        |

Rules that bind ALL four lanes, forever:

- Zero raster: no image files, no canvas `drawImage` of an asset — canvas draws math, SVG draws materials
- Every loop, whatever runs it, pauses on `body.modal-open` and turns off under `prefers-reduced-motion` (for canvas/gsap that means checking the media query + a `modal-open` observer, not just CSS)
- Loop periods keep drifting: taken now 5 / 5.8 / 6.3 / 7 / 8 / 9 / 10.5 / 12
- The wall stays the simplest thing on the page — static SVG. Reaching for gsap/canvas here = drift; their lanes open in later tasks (lever §3.4 of the vibes doc, gearset, counters)

### 10.4 Detail vocabulary — carried forward from the approved builds

The build sessions already ship these moves; later sheets reuse them by name instead of re-inventing:

- **Wood grain** = long horizontal darker/lighter streaks on a `--wood` base (skills board, Portfolio plank)
- **Corner screws** = brass rivet dots at panel corners, light at top of the dot (skills board)
- **Number plates** = digits on small dark slots (repo strip 13 / 14)
- **Wavefield** = canvas sin/cos lines at low opacity under content (repo strip)
- **Tape label** = tilted 1–2deg, handwritten face, names one thing ("Monitor 5" in the aside shot — arrives with task 09)
- **Hazard edge** = yellow-black diagonal stripe band (navbar rail; the aside shot runs it vertically — available for racks later)
