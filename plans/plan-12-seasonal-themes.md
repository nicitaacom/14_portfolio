# plan-12 — seasonal workshop skins

Status lives in [plan-00-tracker.md](plan-00-tracker.md) only.

## Goal

Keep one site and one component tree. A single global seasonal configuration decides which skin is active for a calendar period:

- `workshop` — the existing purple-lamp workshop; default for every unlisted month.
- `halloween` — an autumn workshop for October.
- `new-year` — a winter workshop for December and January.

No page, modal, project, or button may contain a month check. Components consume semantic Tailwind utilities; the active skin only changes the variables those utilities read.

## Proposed global configuration

New file: `app/config/seasonalTheme.ts`.

```ts
export type SeasonalTheme = "workshop" | "halloween" | "new-year"

export const seasonalThemeConfig = {
  defaultTheme: "workshop",
  themes: {
    halloween: { months: [10] },
    "new-year": { months: [12, 1] },
  },
  // Set this to a theme name to preview it locally; null follows the calendar.
  previewOverride: null,
} as const
```

`resolveSeasonalTheme(date)` reads this object, returns the override when present, otherwise maps the local calendar month, then falls back to `workshop`. Changing the active months is therefore one edit in one file.

The layout places the result on the root wrapper as `data-season="workshop | halloween | new-year"`. A tiny client synchronizer recalculates from the visitor’s local time after hydration and schedules the next midnight check; server rendering supplies the initial value so there is no unthemed first paint.

## Tailwind-first contract

The implementation does not add seasonal `if` statements or hard-coded colour classes in components.

1. `tailwind.config.ts` exposes only semantic colours such as `room`, `surface`, `surface-deep`, `trim`, `label`, `accent`, `signal`, and `danger` using CSS variables. Existing screens, spacing, fonts, and `cta` remain unchanged.
2. It also exposes named material utilities via `extend.backgroundImage`: `bg-material-panel`, `bg-material-inset`, `bg-material-plank`, and `bg-material-pipe`. Their gradients read semantic variables, so class names stay stable when the skin changes.
3. Components migrate from material-specific classes such as `bg-wood` and custom workshop-only wrappers to Tailwind combinations such as `bg-material-plank border-trim text-label shadow-machine`.
4. A small `@layer base` block defines the variable values for `:root` and `[data-season="…"]`. It contains tokens only—no component selectors and no page-specific styling.
5. Any unavoidable structural drawing (the brick SVG, snow SVG, or cobweb SVG) is an isolated `aria-hidden` background component selected once by the root theme provider. It uses CSS/SVG only; no raster assets or new packages.

This gives the user one global switch while preserving Tailwind class discoverability, purge safety, and the existing token model.

## Visual direction

| Surface | Workshop (current) | Halloween | New Year |
| --- | --- | --- | --- |
| Room / wall | Violet lamp over black brick | Near-black brick, low amber moon pool, sparse cobweb linework in corners | Blue-black room, frosted steel bricks, cool white overhead pool |
| Panels | Violet-grey steel, brass screws | Oxidized iron, dark walnut, copper screws | Iced blue steel, silver pipe, pewter screws |
| Paper labels | Warm paper tape | Aged parchment with a restrained orange wax-seal accent | Cream paper with a thin icy-blue edge |
| Buttons | Brass-edged workshop plaque | Dark carved wood plaque with copper rim and amber top edge | Blue-grey enamel plaque with silver rim and a pale top edge |
| Accent / status | Untouchable violet `--cta` | `--cta` remains the interactive accent; amber is material light only | `--cta` remains the interactive accent; ice blue is material light only |
| Motion | Existing drift periods | One slow 10s cobweb sway or ember-free lamp shimmer, only if the active wall needs it | One slow 12s snow-dust drift, CSS/SVG only; no competing loop |

Both skins retain the one-lamp rule, straight-down shadows, bright top edges, Inter body copy, and Special Elite only for tape/digits. Seasonal colour never changes the CTA token.

## Implementation order

1. Add `seasonalTheme.ts`, resolver tests, and a documented `previewOverride`.
2. Add the root `data-season` bridge with SSR initial value and local-time hydration correction.
3. Add semantic Tailwind colours, shadows, and material background-image utilities while preserving current workshop values as the default.
4. Convert shared primitives first: `Button`, `Input`, `ModalContainer`, `Project`, panel and bezel utilities. Verify the workshop skin is pixel-stable before adding another skin.
5. Add Halloween tokens plus its one root background component. Inspect home, project, modal, appointment, admin, and mobile.
6. Add New Year tokens plus its one root background component. Run the same inspection matrix.
7. Verify calendar boundary behaviour using the resolver: Sep→Oct, Oct→Nov, Nov→Dec, Jan→Feb; verify `previewOverride` wins every time.
8. Run `npx tsc --noEmit`, inspect both reduced-motion and `body.modal-open`, show the full diff, and wait for approval before any commit.

## Acceptance checks

- Changing only `months` or `previewOverride` in `app/config/seasonalTheme.ts` selects the expected skin.
- No component imports the date, reads the month, or branches on a seasonal theme.
- Existing workshop presentation is the default and unchanged when no season matches.
- Every seasonal surface is CSS/SVG drawn; zero seasonal raster files or image imports.
- Tailwind semantic classes, not seasonal component conditionals, drive shared surfaces.
- All idle motion pauses under `body.modal-open` and disables under `prefers-reduced-motion`.
- `--cta: 277deg 100% 68%` and Tailwind `cta` remain byte-for-byte unchanged.
