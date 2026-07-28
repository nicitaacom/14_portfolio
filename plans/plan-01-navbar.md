# plan-01 — Navbar → HAZARD RAIL on a riveted steel PANEL (build sheet)

**This sheet is self-contained — a fresh session builds from it without the orchestrator chat.**
Status lives in [plan-00-tracker.md](plan-00-tracker.md) only.

## How to run this sheet (new session, read first)

- Repo: `/home/kali/Documents/GitHub/14_portfolio`
- Branch: `git checkout ui/crazy-mechanics` — it exists, all work lands there
- Read before touching code: [dev_readme-it-worked-ui.md](../dev_readme-it-worked-ui.md) §3.1–3.3 + §3.5, and [app/components/Projects/NDAProjectPreview.tsx](../app/components/Projects/NDAProjectPreview.tsx) (the seed — its shadow numbers and gradient style are the law)
- Reference shots: [crazy-mechanics-main.jpg](../public/UI/crazy-mechanics-main.jpg) (bottom rail), [crazy-mechanics-menu.png](../public/UI/crazy-mechanics-menu.png) (riveted plate)
- Never run the dev server. After building, show the diff, list what Nikita opens, STOP
- Commit only after Nikita approves, locally only: `feat: navbar hazard rail` — then hand him `git push -u origin ui/crazy-mechanics`, never push
- A pre-write hook (`no-banned-words.js`, word list in the hook script) blocks lazy words in any file, code comments and class names included. If a write bounces, rename the flagged word to the real noun/verb — never bypass the hook
- Replies to Nikita: bold labels, one fact per line, `-` bullets, real file paths, no prose walls

## Locked decisions — never re-open, never "improve"

- Style is a COMBO: old materials (steel, brass, wood, paper) lit by modern violet `--cta` light. Body type stays Inter
- Materials are drawn: CSS gradients / SVG patterns. Zero raster texture files, zero new images
- One lamp, page-wide: every shadow falls straight down, every top edge brighter than its bottom edge
- box in box: each control sits at least two boxes deep (panel → bezel → control)
- Idle loop periods already taken: 5 / 5.8 / 7 / 9 / 12s. This task adds exactly one loop at **10.5s**
- Every loop pauses on `body.modal-open` and turns off under `prefers-reduced-motion`
- Scope is the navbar ONLY. No Layout, no Button.tsx, no counters, no dropdown-menu internals

## 0. Why

The navbar today is a flat grey strip with a 2px gradient underline. It holds the site's only always-on progress signal, yet nothing about it says "machine". In the game the striped rail is the status edge of the whole bench — making the navbar that rail tells the visitor "this edge is the machine's status" before they read a word.

## 1. Current state — exact anchors

- [app/components/Navbar/Navbar.tsx](../app/components/Navbar/Navbar.tsx) — server component: reads the Redis live flag + admin check, renders NavbarWithProgress. **Zero edits here**
- [app/components/Navbar/NavbarWithProgress.tsx:44-52](../app/components/Navbar/NavbarWithProgress.tsx) — the `<nav>`:

```tsx
<nav
  className="w-full flex justify-between transition-[height] gap-x-sm duration-[600ms] px-md
  text-secondary bg-primary-foreground"
  style={{
    borderBottom: `2px solid #c4c4c4`,
    borderImage: `linear-gradient(to right, hsl(var(--cta)) ${progress}%, #c4c4c4 ${progress}%) 1`,
    overflow: "visible",
  }}>
```

- `progress` state (0–100) is set by a 100ms interval at NavbarWithProgress.tsx:29-42 — **keep that logic untouched**, only its paint changes
- [app/components/Navbar/NavbarProjects.tsx:15-38](../app/components/Navbar/NavbarProjects.tsx) — drag-scroll strip of repo links, desktop only
- [app/components/Navbar/ProgressBorder.tsx](../app/components/Navbar/ProgressBorder.tsx) — zero imports anywhere in `app/` (verified by grep); NavbarWithProgress re-implements it inline; has a leftover `console.log`
- [app/globals.css:7-20](../app/globals.css) — `:root` tokens; [globals.css:290-310](../app/globals.css) — the `body.modal-open` pause list + reduced-motion list; [globals.css:597-611](../app/globals.css) — `.navbar-right-shadow` with hard-coded `rgb(48, 48, 48)`
- Navbar is mounted once, in `app/[locale]/layout.tsx`

## 2. Target — the parts

```
╔══◉═══════════════════════════════════════════◉══╗  ← steel plate face, rivet each end,
║  Portfolio   │  repo strip (engraved links)  │ ⛭ ║    top edge brighter than bottom
╚══◉═══════════════════════════════════════════◉══╝
▓▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓  ← HAZARD RAIL: warning stripes,
      ────────────►                                    scroll progress = --cta light pool
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       shadow straight down onto the page
```

Box depth on this surface: plate (panel) → bezel → dropdown trigger = 3 deep. Links engraved into the plate face.

## 3. Steps — exact edits, in this order

### Step 1 — material tokens

**[app/globals.css](../app/globals.css)** — append inside `:root` after line 19 (`--success`):

```css
--steel: 276deg 10% 22%; /* #38323F — panel face, from the seed */
--steel-deep: 270deg 21% 9%; /* #17131D — panel shadow side, from the seed */
--wood: 28deg 25% 22%;
--brass: 40deg 45% 55%;
--paper: 38deg 40% 88%;
--blueprint: 210deg 25% 30%;
```

**[tailwind.config.ts](../tailwind.config.ts)** — append inside `extend.colors` after `success`:

```ts
steel: "hsl(var(--steel) / 1)",
"steel-deep": "hsl(var(--steel-deep) / 1)",
wood: "hsl(var(--wood) / 1)",
brass: "hsl(var(--brass) / 1)",
paper: "hsl(var(--paper) / 1)",
blueprint: "hsl(var(--blueprint) / 1)",
```

All six land now even though this task uses only steel/steel-deep/brass — every later task reads them from here.

### Step 2 — rail + plate CSS recipes

**[app/globals.css](../app/globals.css)** — add to the existing `@layer components` block:

```css
.navbar-plate {
  background: linear-gradient(to bottom, hsl(var(--steel)), hsl(var(--steel-deep)));
  box-shadow:
    0 12px 12px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.navbar-rivet {
  background: radial-gradient(circle at 50% 32%, #d8c48a 0%, hsl(var(--brass)) 38%, #6b5a33 72%, #2a2117 100%);
  border-radius: 9999px;
  box-shadow:
    0 2px 2px rgba(0, 0, 0, 0.6),
    inset 0 -1px 1px rgba(0, 0, 0, 0.5);
  height: 10px;
  width: 10px;
}

.hazard-rail {
  animation: rail-crawl 10.5s linear infinite;
  background: repeating-linear-gradient(-45deg, hsl(var(--warning)) 0 8px, #111111 8px 16px);
}

.hazard-rail-progress {
  background: hsl(var(--cta) / 0.45);
  box-shadow: 0 0 10px hsl(var(--cta) / 0.8);
  height: 100%;
  transition: width 150ms linear;
}

.navbar-engraved {
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08),
    0 -1px 1px rgba(0, 0, 0, 0.65);
}

.navbar-bezel {
  background: hsl(var(--steel-deep) / 0.6);
  border-radius: 8px;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.6),
    inset 0 -1px 0 rgba(255, 255, 255, 0.06);
  padding: 2px 4px;
}
```

Keyframes, next to the `nda-*` keyframes (~line 256):

```css
@keyframes rail-crawl {
  to {
    background-position-x: 22.63px;
  }
}
```

`22.63px = 16 / sin(45°)` — the exact horizontal shift that maps the −45° 16px stripe tile onto itself, so the loop repeats with zero visible jump. Do not round it.

Physics notes, so nothing gets "corrected":

- Plate shadow `0 12px 12px rgba(0,0,0,0.75)` copies the seed's `nda-soft-shadow` (dy 12, blur 12, black 0.75). Straight down, never offset in x
- Engrave: the glyph is cut INTO the plate, lamp above → bright edge BELOW the glyph (`0 1px 0` white), dark edge ABOVE (`0 -1px 1px` black). Do not flip
- Rivet: light at top (`circle at 50% 32%`), dark at bottom — same rule as every top-edge-brighter surface

### Step 3 — pause + reduced-motion (both mandatory)

**[app/globals.css:290-310](../app/globals.css)** — append `.hazard-rail` to BOTH existing lists:

```css
body.modal-open .hazard-rail {
  animation-play-state: paused;
}
```

(join the existing `body.modal-open .nda-*` selector group), and inside `@media (prefers-reduced-motion: reduce)` add `.hazard-rail` to the `animation: none` selector list. The stripes stay visible in both cases — only the crawl stops.

### Step 4 — NavbarWithProgress.tsx rework

Replace the `<nav>` opening tag (lines 44-52) with:

```tsx
<nav
  className="navbar-plate relative w-full flex justify-between transition-[height] gap-x-sm duration-[600ms]
  px-md pb-[6px] text-secondary overflow-visible">
```

- `bg-primary-foreground` → gone (plate gradient takes over)
- the whole `style` prop → gone (`overflow: visible` moves to the `overflow-visible` class — dropdowns depend on it, keep it)
- `pb-[6px]` reserves the rail's height so link baselines sit on the plate, not on the stripes

As the LAST children inside `<nav>`, after the right-side div, add the rail and the two rivets:

```tsx
<div className="hazard-rail absolute bottom-0 left-0 h-[6px] w-full" aria-hidden="true">
  <div className="hazard-rail-progress" style={{ width: `${progress}%` }} />
</div>
<span className="navbar-rivet absolute left-[6px] top-1/2 -translate-y-1/2" aria-hidden="true" />
<span className="navbar-rivet absolute right-[6px] top-1/2 -translate-y-1/2" aria-hidden="true" />
```

- `progress` state, its interval, `useIsGMLive`, locale, i18n — all untouched
- The Portfolio `<Link>` (line 54-59): add `navbar-engraved` to its className; keep the existing `text-shadow`/`data-text` mechanism as is (it layers fine under the engrave)
- The right-side div (line 62): put `<LanguageDropdown />` inside `<div className="navbar-bezel">…</div>`, and `<AdminDropdown …/>` inside its own `<div className="navbar-bezel">…</div>`. The desktop divider line between them stays outside both bezels

### Step 5 — NavbarProjects.tsx

- Add `navbar-engraved` to the repo `<Link>` className (line 28) and to the `<p>` with `repo.id` (line 26)
- Nothing else — drag logic, layout, desktop-only visibility all stay

### Step 6 — sweep

- Delete [app/components/Navbar/ProgressBorder.tsx](../app/components/Navbar/ProgressBorder.tsx) — zero imports, superseded by the inline progress; its `console.log` goes with it
- [app/globals.css:607](../app/globals.css) — in `.navbar-right-shadow::before`, `rgb(48, 48, 48)` → `hsl(var(--steel))` so the fade matches the new plate

## 4. Forbidden moves (drift guards)

- No new npm package, no SVG file, no PNG/JPG, no inline `<svg>` — this surface is pure CSS
- No edits to Navbar.tsx, Layout.tsx, layout.tsx, Button.tsx, LanguageDropdown.tsx, AdminDropdown.tsx internals
- No second animation, no hover glow on the rail, no shimmer — one loop at 10.5s, that is the entire motion budget of this task
- No color outside the tokens + the two rgba edge highlights + `#111111` stripe gap
- No shadow with an x offset anywhere
- No renaming of existing classes, props, state, or i18n keys
- Keep the 100ms polling interval exactly as is even if a scroll listener looks cleaner — out of scope
- If the pre-write hook bounces a word, rename the word — never bypass the hook

## 5. Done checklist

- [ ] Shadow under the navbar falls straight down (y-offset only)
- [ ] Plate top edge brighter than its bottom edge (inset white 1px at top)
- [ ] Both dropdown triggers sit two boxes deep: plate → bezel → trigger
- [ ] Rail crawl: 10.5s, linear, seamless at the loop point (22.63px shift)
- [ ] Crawl paused when `body.modal-open`; `animation: none` under reduced motion; stripes visible in both
- [ ] Zero raster files added; stripes, rivets, steel are gradients
- [ ] `ProgressBorder.tsx` removed, type check still green (`npx tsc --noEmit`)
- [ ] Screenshot next to [crazy-mechanics-main.jpg](../public/UI/crazy-mechanics-main.jpg) bottom rail — same read

## 6. What Nikita opens to check (he runs the server, never you)

- `/` any locale — navbar reads as a steel plate with a striped bottom rail, shadow onto the page below
- Drag the repo strip sideways (desktop width) → violet pool slides along the stripes to match scroll
- Open any modal → stripe crawl freezes; close it → crawl resumes
- OS reduced-motion on → everything static, stripes + progress still visible
- Mobile width → repo strip hidden as today, plate + rail + rivets still correct
- Admin session → both dropdowns open above the plate (overflow intact), each sitting in its bezel

## 7. After approval

- Commit locally: `feat: navbar hazard rail`
- Hand over: `git push -u origin ui/crazy-mechanics`
- Update task 01 → `done` in [plan-00-tracker.md](plan-00-tracker.md) (the only status board)

---

## 8. Revision A — Nikita's screenshot review of the first build

Three asks from the screenshot, nothing else re-opens:

1. Dropdowns (Language + Admin) get the crazy-mechanics look — Nikita authorized touching their className strings for THIS revision (the "no dropdown internals" guard now means: logic, hooks, state, positioning stay; paint changes)
2. Repo strip: better font sizes + a Google font served through `next/font` (server-side, self-hosted, preloaded at build — that is the Next.js font optimization he wants)
3. Repo items themselves restyled to the machine language

Steps 8.1–8.4 in order. Same STOP protocol: build, show diff, wait.

### 8.1 Typeface — Special Elite through next/font

**Pick: [Special Elite](https://fonts.google.com/specimen/Special+Elite)** — an aged-typewriter face. The vibes doc allows typewriter type for one-two words at a time (tape labels, digits); body copy stays Inter (locked decision №2). It marks the odometer digits here and is reused later by tape labels (task 09) and counters (task 10).

New file `app/fonts.ts`:

```ts
import { Inter, Special_Elite } from "next/font/google"

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
export const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
})
```

- `app/[locale]/layout.tsx` — add both variable classes to the root element's className: `${inter.variable} ${specialElite.variable}`
- [tailwind.config.ts:6-8](../tailwind.config.ts) — `primary: ["var(--font-inter)", "Inter", "sans-serif"]`, and add `typewriter: ["var(--font-typewriter)", "monospace"]`
- [app/globals.css:1](../app/globals.css) — delete the `@import url("https://fonts.googleapis.com/...Inter...")` line. next/font self-hosts both faces: zero render-blocking request, preload link injected server-side, zero layout shift
- Note: Special Elite ships latin only — it styles digits and latin repo names' numbers, never locale text (ru/ua strings stay Inter). Fallback `monospace` covers the rest

### 8.2 Repo strip items → odometer plates

Current, [NavbarProjects.tsx:25-33](../app/components/Navbar/NavbarProjects.tsx):

```tsx
<li key={repo.id} className="flex flex-col items-center w-[10rem] select-none">
  <p className="navbar-engraved flex justify-center">{repo.id}</p>
  <Link className="navbar-engraved transition-all duration-200 ease-in hover:brightness-75 whitespace-nowrap cursor-pointer select-none " ...>
```

Target — the odometer strip from [crazy-mechanics-main.jpg](../public/UI/crazy-mechanics-main.jpg) bottom rail:

```
 ┌────────┐
 │▓ 12 ▓│      ← recessed slot, typewriter digits, tracking wide
 └────────┘
 shopping cart   ← engraved Inter, text-sm
```

- `<p>` → `<p className="machine-slot font-typewriter text-xs tracking-[0.12em] px-[8px] py-[1px] text-secondary-foreground">{repo.id}</p>` (drop `navbar-engraved` on the digits — they sit IN a slot, not cut into the plate; two treatments at once contradict each other)
- `<Link>` → add `text-sm`, replace `hover:brightness-75` with `hover:text-secondary hover:[text-shadow:0_0_6px_hsl(var(--cta)/0.6)]` — in a lamp-lit room a hovered thing catches light and brightens; dimming on hover points the physics backwards
- `<li>` gains `gap-y-[2px]`; `w-[10rem]` and drag logic stay exactly as they are
- Left edge of the strip cuts glyphs mid-letter (screenshot: "ct"). Add a `.navbar-left-shadow` twin of `.navbar-right-shadow` in [globals.css:597-611](../app/globals.css) — same 80px gradient, mirrored (`left: 100%`, `to right`), color `hsl(var(--steel-deep))` — and put it on the Portfolio container div ([NavbarWithProgress.tsx:48](../app/components/Navbar/NavbarWithProgress.tsx)). Update `.navbar-right-shadow::before` to the same `hsl(var(--steel-deep))` so both fades match the plate

### 8.3 Two shared recipes for machine chrome

Add to the `@layer components` block in [app/globals.css](../app/globals.css) — both get reused by every later dropdown/menu/readout task:

```css
.machine-face {
  background: linear-gradient(to bottom, hsl(var(--steel)), hsl(var(--steel-deep)));
  border: 1px solid hsl(var(--brass) / 0.35);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 12px 12px rgba(0, 0, 0, 0.6);
}

.machine-slot {
  background: #0d0b10;
  border-radius: 4px;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.7),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}
```

Physics: face = raised steel (bright top inset, shadow straight down, brass ring); slot = recessed (dark inset at top, faint light at its bottom lip). Never mix both on one element.

### 8.4 Dropdowns → machined steel

Class swaps only — every hook, handler, cookie write, zustand call, position offset, z-index and duration stays byte-identical.

**[LanguageDropdown.tsx](../app/components/Navbar/LanguageDropdown.tsx)**

- Trigger (line 51): `rounded-[12px] border border-[#3b3b3b] bg-[#232323] shadow-[0_8px_22px_rgba(0,0,0,0.14)]` → `machine-face rounded-[6px]`; `hover:border-cta/70 hover:bg-[#292929]` → `hover:border-cta/70 hover:brightness-110`; isOpen variant `border-cta/70 bg-[#292929]` → `border-cta/70 brightness-110`. Height, min-width, flex, padding stay
- Globe badge (line 57): `border-[#4a4a4a] bg-[#2b2b2b]` → `border-brass/40 bg-steel-deep`; the `TbWorld` icon `text-secondary-foreground` → `text-brass`
- Arrow (line 62): `text-secondary-foreground` → `text-brass/80`; the open-state `text-secondary` stays
- Menu (line 72): `rounded-[14px] border border-[#3b3b3b] bg-[#242424] shadow-[0_16px_40px_rgba(0,0,0,0.24)]` → `machine-face rounded-[6px]` (its shadow is already straight down — drop the arbitrary shadow class)
- Option rows (line 80): `rounded-[10px] border border-[#3b3b3b] bg-[#1f1f1f]` → `machine-slot border border-transparent`; hover `hover:border-cta/60 hover:bg-[#292929]` → `hover:border-cta/60 hover:brightness-125`; selected `border-cta/70 bg-[#292929]` → `border-cta/70 brightness-125`; the violet dot stays. Row text stays Inter `text-sm` (body rule)

**[AdminDropdown.tsx](../app/components/Navbar/AdminDropdown.tsx)**

- Trigger (line 40): `rounded-[10px] border border-[#3b3b3b] bg-[#232323]` → `machine-face rounded-[6px]`; hover/isShowDropdown `bg-[#292929]` swaps → `brightness-110` same as 8.4 trigger rule
- Arrow (line 46): `text-secondary-foreground` → `text-brass/80`
- Menu (line 56): `rounded-[12px] border border-[#3b3b3b] bg-[#242424] shadow-[0_18px_40px_rgba(0,0,0,0.34)]` → `machine-face rounded-[6px]`; keep `-translate-x-[58%]` and `top-[calc(100%+14px)]` untouched
- GMCheckbox row (line 62) and dashboard Link (line 68): `border-[#333333]`/`border-[#3b3b3b]` + `bg-[#1f1f1f]` → `machine-slot border border-transparent`; Link hover `hover:border-cta hover:bg-[#292929]` → `hover:border-cta hover:brightness-125`

twMerge note: `machine-face` / `machine-slot` are not tailwind utilities — twMerge passes them through untouched; put them first in the string and let the tailwind classes after them keep merging as before.

### 8.5 Revision drift guards

- No new animation — the motion budget of this task closed at one 10.5s loop
- No edits to `useSlider`, `useCloseOnClickOutside`, `useCloseOnClickEsc`, `GMCheckbox`, zustand stores, locale files
- No font applied page-wide except swapping Inter's delivery to next/font — rendered text sizes outside the navbar stay untouched
- Every new shadow keeps x = 0
- The rail, plate, rivets, bezels from steps 1–6 stay exactly as built

### 8.6 Revision done checklist

- [ ] `app/fonts.ts` exists; `@import` gone from globals.css line 1; view-source shows a `<link rel="preload" ... font/woff2>` for both faces
- [ ] Repo digits render in Special Elite inside recessed slots, names Inter text-sm engraved
- [ ] Strip fades out on BOTH edges in steel-deep, zero mid-glyph hard cuts
- [ ] Both dropdown triggers + menus read as machined steel with brass rings, violet only on hover/active
- [ ] Hover anywhere in the navbar brightens, never dims
- [ ] `npx tsc --noEmit` green

### 8.7 What Nikita opens to check (revision)

- Desktop `/` — repo strip: small typewriter digits in dark slots, names below, both edge fades
- Hover a repo name → it lights violet-white, no dimming
- Open Language dropdown → steel face, brass ring, slots per language, violet dot on the active one
- Admin session → Panel dropdown same family; GM checkbox row sits in a slot
- DevTools network → fonts come from `/_next/static`, not `fonts.googleapis.com`
