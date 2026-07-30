# Halloween UI continuation plan

## Goal

Continue the seasonal-theme work on the `ui/crazy-mechanics` branch without disturbing the existing development server or
mixing unrelated work into commits.

The immediate outcomes are:

1. Thunder audio and the Halloween storm visuals must start together.
2. The spider web in the top-right of the desktop repository navbar must be noticeably more visible.
3. The home-page skills section must read as one high-quality gravestone, not as a Crazy Mechanics panel recoloured purple.

## Non-negotiable working rules

- Work in `/home/kali/Documents/GitHub/14_portfolio` on `ui/crazy-mechanics`.
- Do not deploy to or alter production.
- Do not push.
- Keep the existing `pnpm dev` process on `http://localhost:3014` running. Reuse it; do not start a second dev server on
  port 3014 and do not stop the current one.
- Do not discard, overwrite, reset, or broadly stage the dirty worktree. The worktree contains intentional user changes.
- Read and follow `commit-patterns.md`.
- One completed task/module/widget/page per commit.
- Never run `git add .`, `git add -A`, or otherwise stage all files at once.
- Before every commit, run `git diff --cached --stat` and confirm it contains only that task.
- Commit messages must be 12–40 characters.
- After every commit, run `git log -1 --oneline`.
- The current sandbox exposes `.git` as read-only. If that remains true, make and verify the file changes but do not fake or
  claim a commit.
- Preserve the user's temporary theme-month test mapping:

  ```ts
  export const THEME_MONTHS = {
    // "crazy-mechanics": [6, 7],
    "crazy-mechanics": [10],
    halloween: [7],
    "new-year": [12, 1],
  } as const satisfies ThemeMonthSchedule
  ```

## User intent and visual direction

Halloween is a full alternate visual system, not a recoloured Crazy Mechanics skin. Use `public/UI/halloween/` as visual
reference material, especially `halloween-5.jpg` and `graves.jpg`, but recreate production visuals with responsive CSS,
SVG, Canvas, Framer Motion, and GSAP.

Current Halloween vocabulary:

- almost-black graveyard environment;
- carved stone, bones, thorn frames, webs, graves, pumpkins, cemetery green, bone-grey text;
- orange only for strong action accents;
- no steel sheets, workshop brick, brass rivets, machine plates, or hazard-stripe visual language;
- animation remains decorative, pointer-events-free, responsive, and reduced-motion aware.

The detailed design contract is in `dev_readme-ui-halloween.md`.

## What is already implemented

### Seasonal theme resolution

- `app/consts/THEME_MONTHS.ts` contains the global month schedule.
- `app/utils/resolveSeasonalTheme.ts` validates months.
- Invalid months such as `13`, non-integers, and months assigned to multiple themes resolve to the default theme.
- `app/hooks/useSiteTheme.ts` and `app/components/SeasonalThemeLifecycle.tsx` own runtime theme state.

### Halloween visual system

- `app/components/Halloween/HalloweenScene.tsx` owns the base ambient graveyard scene.
- `app/components/Halloween/HalloweenFrameOrnaments.tsx` owns theme framing.
- `app/components/Halloween/HalloweenRequestHand.tsx` is the skeleton-hand request lever.
- `app/components/Halloween/HalloweenBookingLoadingScene.tsx` owns Halloween booking/loading visuals.
- `app/styles/theme-halloween.css` contains the Halloween overrides.
- Localized Halloween strings exist in `app/locales/{en,de,pl,ru,ua}.ts`.
- The skeleton hand is intended only for buttons that send/mutate/refetch API data. Navigation, modal close/back, tabs,
  filters, and local-only controls must not receive it.

### Horizontal overflow correction

The Halloween page previously exceeded the viewport by about 6 px.

- `app/styles/theme-core.css`: `.seasonal-backdrop` no longer redundantly uses `width: 100vw`; fixed inset positioning fills
  the viewport.
- `app/styles/theme-halloween.css`: Halloween scene/event SVGs clip their own decorative overflow.
- Navbar frame ornaments use `inset-inline: 0`, `width: 100%`, and hidden overflow instead of extending 6 px past both
  sides.
- Prior runtime audits at 390, 624, and 1440 px found `document.body.scrollWidth === document.documentElement.clientWidth`.

### Random thunder-and-grave event

`app/components/Halloween/HalloweenGraveEvent.tsx` is mounted from `app/[locale]/layout.tsx`.

It currently provides:

- a random first event after 18–30 seconds;
- repeat events every 75–130 seconds;
- a 4–6 second storm/grave appearance;
- `window.dispatchEvent(new Event("halloween:grave-event"))` as a local preview/testing trigger;
- deferral while the document is hidden or `body.modal-open` is present;
- reduced-motion suppression;
- Canvas rain;
- SVG branched lightning and an original detailed Plants-vs-Zombies-inspired gravestone;
- GSAP flash/glow timelines and audio fade-out;
- Framer Motion event/grave transitions;
- localized gravestone epitaph;
- local audio elements for `/thunderstorm.mp3` and `/creepy-halloween-bells.mp3`.

The event wrapper intentionally has explicit fixed geometry in `app/styles/theme-halloween.css`:

```css
.halloween-grave-event {
  contain: layout paint;
  height: 100%;
  inset: 0;
  isolation: isolate;
  overflow: clip;
  position: fixed;
  width: 100%;
}
```

Do not remove the explicit height/width/inset; a prior runtime test found the wrapper collapsed to a zero-sized box without
them.

`middleware.ts` excludes static audio extensions (`mp3`, `wav`, `ogg`, `m4a`) from locale middleware. Both local MP3s
currently return HTTP 200 with `Content-Type: audio/mpeg`.

The previously requested YouTube “Money In The Grave” iframe was later rejected by the user because YouTube displayed an
embed error. It has been completely removed. Do not reintroduce the iframe, video URL, player code, video i18n, or a video
modal/background.

## Current in-progress storm synchronization change

The reported problem was that `thunderstorm.mp3` and the visual storm did not begin together.

The current edit in `HalloweenGraveEvent.tsx` changes the timing model:

- entering the `"storm"` phase no longer starts visuals immediately;
- audio is reset to `currentTime = 0`, assigned its target volume, and `play()` is called;
- the thunder track is the master synchronization source;
- `stormPlaybackStarted` becomes true only when the thunder `play()` promise resolves (or falls back after rejection);
- GSAP lightning, Canvas rain, Framer visibility/grave reveal, and the 4–6 second finish countdown all wait for
  `stormPlaybackStarted`;
- the old 650 ms audio fade-in was removed so the thunder is not intentionally delayed behind the first flash.

This change was patched immediately before this handoff and still needs full static and browser validation.

Important edge cases to verify:

- triggering while a previous storm is active must not leave audio or timers orphaned;
- hiding the tab or opening a modal must stop/reset both tracks and clear the event;
- autoplay rejection must not cause an unhandled promise rejection;
- after the event, both audio elements must be paused, at time zero, and have no lingering GSAP tween;
- no storm/grave visual should be visible before playback has actually begun after a normal user activation.

## Next task 1: validate and finish exact audio/visual synchronization

1. Run static checks first:

   ```sh
   pnpm lint
   npx tsc --noEmit
   git diff --check
   ```

2. In a test browser, perform one user activation, then trigger:

   ```js
   window.dispatchEvent(new Event("halloween:grave-event"))
   ```

3. Poll at roughly 10 ms intervals and record:

   - first sample where the thunder element is playing and `currentTime > 0`;
   - first sample where `.halloween-storm-layer` has computed opacity above zero;
   - first sample where the rain Canvas is mounted/drawing;
   - first sample where the grave begins becoming visible.

4. The audio/visual start delta should be no more than one rendered frame in normal conditions (roughly 16–25 ms).
5. At about 1.5 seconds, confirm audio, rain, lightning timeline, and grave are all active.
6. After the randomized 4–6 second duration plus fade-out, confirm:

   - storm/grave/rain are absent;
   - both audio elements are paused and reset to time zero;
   - no iframe exists;
   - viewport width still has zero horizontal overflow.

7. Test the same behavior at desktop and mobile widths.
8. Re-test the default theme and `prefers-reduced-motion: reduce`; the event must not appear or play.
9. If `play()` promise timing is not sufficiently exact in Chromium, use the thunder element’s one-shot `playing` event as
   the master gate, with a guarded `play()` rejection fallback. Do not return to independent timers for audio and visuals.

Suggested isolated commit message after this task alone is staged and verified:

```text
fix: sync halloween thunder
```

## Next task 2: make the navbar top-right spider web clearly visible

The target is the desktop element:

```html
<div class="navbar-repo-wavefield relative isolate hidden desktop:flex flex-1 min-w-0 overflow-hidden pb-[6px]">
```

Relevant implementation:

- `app/components/Navbar/NavbarProjects.tsx`
- Halloween branch of `app/components/Navbar/NavbarWaves.tsx`
- `.navbar-wave-canvas` in `app/globals.css`
- Halloween navbar overrides in `app/styles/theme-halloween.css`

Current Canvas code draws mirrored corner webs at `x = 0` and `x = width` with only five spokes, three rings, and
`rgba(205, 195, 213, 0.12)`. In the user screenshot the top-right web is barely visible behind the repository items.

Required redesign:

- keep the web behind the repository text and hit targets;
- make the top-right web the stronger focal web;
- enlarge it enough that several rings and radial threads are visible in the top-right quarter;
- use more spokes and 4–5 connecting arcs, with a bone-grey/lilac stroke around 0.22–0.34 alpha;
- optionally give the primary threads a very restrained secondary glow stroke;
- keep the left web lighter so the panel does not become symmetrical visual noise;
- account for `scrollPositionRef` only as subtle parallax; scrolling must not make the web disappear;
- preserve Canvas DPR capping, resize behavior, pointer-events, text contrast, and zero horizontal overflow;
- check narrow desktop widths where repository items overlap the art.

Do not place a raster web image into the navbar.

Suggested isolated commit message:

```text
style: reveal navbar spiderweb
```

## Next task 3: turn the skills section into a gravestone

The user’s latest screenshot identifies the skills block containing:

- `html&css — 6540h`
- `React — 6153h`
- `Next — 4990h`
- `TypeScript — 6059h`
- `other — 1261h`

Relevant files:

- `app/views/HomePageView.tsx`
- `app/components/Skill.tsx`
- `app/styles/theme-halloween.css`
- `app/styles/theme-core.css`

The outer list is currently:

```tsx
<ul className="workbench-board flex flex-col gap-y-sm rounded-[4px] p-md">
```

Required interpretation: the five skills remain one grouped skills widget, and the whole widget becomes a single
gravestone. Do not turn every individual skill row into a separate grave.

Implementation direction:

- add a stable semantic class such as `skills-board` to the existing list;
- create a reusable, code-native SVG grave frame/ornament if CSS alone cannot produce a convincing silhouette;
- shape the outer surface with a rounded/crooked tomb crown, tapered or chipped shoulders, a thick stone edge, cracked
  face, moss accents, and a layered soil/base slab;
- ensure the silhouette is unmistakably a grave even if all text is hidden;
- treat skill labels as engraved stone nameplates or bone banners;
- treat progress tracks as narrow inset ectoplasm/potion channels carved into the stone;
- keep the animated hour values, CountUp behavior, GSAP progress animation, tooltips, and all content readable;
- remove Halloween use of the rectangular Crazy Mechanics `workbench-board` visual vocabulary for this widget;
- default, Crazy Mechanics, and New Year appearances must remain unchanged;
- do not hard-code visible English in SVG; decorative SVG should be `aria-hidden`;
- prevent ornament layers from intercepting tooltips or pointer input;
- preserve responsive sizing at mobile/tablet/desktop and avoid horizontal overflow;
- use `public/UI/halloween/graves.jpg` only as a shape/material reference; do not embed or trace the raster.

Suggested isolated commit message:

```text
style: shape skills as grave
```

## Verification matrix

For each completed task:

```sh
pnpm lint
npx tsc --noEmit
git diff --check
```

Then inspect `http://localhost:3014` in at least:

| Viewport | What to verify |
| --- | --- |
| 390 × 844 | no horizontal scroll, gravestone skills remain readable, storm fits |
| 624 × 900 | no clipped grave/web ornaments |
| 1440 × 900 | navbar top-right web is visible; full skills grave reads clearly |

Also verify:

- `/` returns HTTP 200;
- `/thunderstorm.mp3` returns HTTP 200 and `audio/mpeg`;
- `/creepy-halloween-bells.mp3` returns HTTP 200 and `audio/mpeg`;
- no `iframe`, `R0ykLlhg0AQ`, or “Money In The Grave” code remains;
- non-Halloween themes do not render Halloween event/audio/ornaments;
- `document.body.scrollWidth === document.documentElement.clientWidth`.

## Current repository state at handoff

- Branch: `ui/crazy-mechanics`
- Current `HEAD`: `e8eec7f style: appointment booking modal UI`
- Existing dev server: alive on port 3014; `/` returned HTTP 200 at handoff.
- Staged diff: empty at handoff.
- Worktree: intentionally very dirty, with both modified and untracked seasonal-theme files. Inspect `git status --short`
  before touching anything.
- The two audio files are:
  - `public/thunderstorm.mp3` — about 11.8 seconds;
  - `public/creepy-halloween-bells.mp3` — about 20.7 seconds.

No production change or push has been performed.
