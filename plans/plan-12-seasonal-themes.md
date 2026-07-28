# plan-12 — calendar-driven site themes

Status lives in [plan-00-tracker.md](plan-00-tracker.md) only.

## Goal

Keep one site and one component tree while changing the complete visual skin from the visitor's local calendar month:

- `crazy-mechanics` — June and July
- `halloween` — November
- `new-year` — December and January
- `default` — every other month

No page, modal, project, or button contains a month check. The root theme changes shared CSS variables and background layers.

## Global configuration

`app/consts/THEME_MONTHS.ts` is the only month schedule:

```ts
export const THEME_MONTHS = {
  "crazy-mechanics": [6, 7],
  halloween: [11],
  "new-year": [12, 1],
} as const
```

`resolveSeasonalTheme(month)` returns the matching theme or `default`. Month values use the human-readable `1–12` range.
There is no query-string, local-storage, or production preview override.

The schedule accepts only the integer `1–12` union, so TypeScript rejects values such as `13`. Invalid runtime resolver
inputs still return `default`. If two themes contain the same valid month, that month also resolves to `default`; the
resolver never relies on object order to choose a winner.

## Runtime behavior

The root layout serializes the month schedule into a small pre-hydration script and sets `data-theme` on `<html>`.
The initial server value stays `default`, so the visitor's local month never creates server/client text differences.

A client lifecycle synchronizes the theme after hydration, at the next local midnight, when a suspended page becomes visible,
and when it returns from the browser page cache.

## Visual contract

- `default` is a clean dark-purple portfolio without workshop hardware or seasonal decorations.
- `crazy-mechanics` retains the current brick workshop, brass fasteners, paper labels, steel controls, and violet lighting.
- `halloween` follows [dev_readme-ui-halloween.md](../dev_readme-ui-halloween.md): a moonlit graveyard shell with
  purple crypt slabs, thorn-and-web frames, skulls, pumpkins, potion meters, orange spell controls, spectral fog, and bats.
  It deliberately contains no pipes, rivets, gears, hazard stripes, blueprint paper, workshop brick, or mechanical loaders.
- `new-year` changes the entire shell to blue-black surfaces, frosted steel, silver labels, ice-blue controls, snow, aurora, and frost.
- Navbar, shared cards, project frames, tooltips, modals, appointment pages, appointment loading, auth, and admin surfaces all consume the active tokens.
- The Halloween booking state uses i18n text with Canvas fog, an SVG ritual scene, Framer transitions, and GSAP timelines.
- Halloween remote-action buttons alone receive the animated SVG skeleton-hand lever; local controls and links do not.
- New default, Halloween, and New Year decoration layers are CSS/SVG/Canvas, `aria-hidden`, paused while a modal is open, and disabled for reduced motion.

## Verification

- Resolver tests cover May→June, July→August, October→November, November→December, and January→February.
- October explicitly resolves to `default`; November explicitly resolves to `halloween`.
- Browser inspection covers desktop, mobile, appointment page, and appointment modal for all four themes.
- The browser console must remain free of runtime and hydration errors.
- `npx tsc --noEmit`, `pnpm lint`, and `git diff --check` must pass before the task is committed.
