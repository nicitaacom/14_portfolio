# UI system

### Why this exists

A seasonal theme here is a **complete UI system**, not a recolour of Crazy Mechanics.

This file is the contract for that system. It is deliberately **not** a per-theme document — there is no
`dev_readme-ui-<theme>.md` for every theme. `dev_readme-ui-halloween.md` exists only because Halloween ships
extra bespoke components (scene, grave event, skeleton lever) that need their own notes. The system itself —
how a theme is built, what a theme owns, when a theme is finished — lives here and applies to all of them.

The failure this prevents: a theme that only remaps colour variables. It keeps every rivet, every brushed-metal
stripe, every gear and every crooked workshop label from Crazy Mechanics, and reads as Crazy Mechanics wearing a
different palette. New Year was in exactly that state — 3 component overrides against Halloween's 112.

### The three layers

```
  app/styles/theme-core.css          shared surfaces; every value is var(--theme-*)
        ▲                            .workbench-board .machine-panel .plaque .tape-label ...
        │ reads
        │
  :root[data-theme="new-year"]  ──►  --theme-panel-background: <ice gradient>
    in app/styles/theme-<name>.css    --theme-fastener-opacity: 0
        │
        │ then, ONLY for shape work that lives outside the token set
        ▼
  :root[data-theme="new-year"] .hazard-rail { <garland> }
```

Layer order in `app/layout.tsx` is `theme-core` → `theme-crazy-mechanics` → `theme-halloween` → `theme-new-year`.
These files are unlayered, so they outrank anything Tailwind emits in `@layer`.

**Reach for layer 2 before layer 3.** Most of a theme is achievable with tokens alone, and every token you set is
a surface you do not have to re-specify. Layer 3 is for shape changes — a silhouette, an ornament, a replaced
motif — not for colour.

### Token contract

| Token | Drives | Set it to 0 / none when |
| --- | --- | --- |
| `--theme-fastener-opacity` | `.navbar-rivet`, `.machine-panel::before`, `.project-wood-body::before` | the theme has no rivets |
| `--theme-hardware-opacity` | `.navbar-plate::before`, `.lever-gate::before`, `.modal-frame-hardware` | the theme has no bevel hardware |
| `--theme-label-rotation` | `.tape-label`, `.paper-tab`, `.modal-title-label`, tooltips | labels are not stuck-on tape |
| `--theme-radius` | every themed surface | — |
| `--theme-trim` / `--theme-trim-strong` | borders across all surfaces | — |
| `--theme-*-background` | board, panel, inset, control, label, frame, project, input, modal, appointment surfaces | — |

Halloween and New Year both set the first three to `0` / `0deg`. Crazy Mechanics is the only theme that wants
rivets and tilted labels — they are its signature, not a shared default.

### Decisions made AGAINST

- **Against per-theme docs.** One system contract, not N skin files. Only bespoke component sets earn their own doc.
- **Against a `halloween:` / `new-year:` Tailwind variant.** No theme variant exists in `tailwind.config.ts` and no
  JSX uses one. Theme overrides live in the theme CSS files. A utility class is specificity `(0,1,0)` and loses to
  `:root[data-theme="x"] .y` at `(0,3,0)`, so a variant would need `!important` on every class.
- **Against material tokens standing in for semantic scales.** See below — this was a real bug.
- **Against raster art for theme ornaments.** Reference images in `public/UI/` are shape reference only; production
  visuals are CSS, SVG, Canvas, Framer Motion, GSAP.

### Material tokens vs semantic scales

`--brass`, `--steel`, `--wood`, `--pipe`, `--cta` are **material** tokens: each theme repoints them at its own
substance. They must never be borrowed as steps in a scale that conveys meaning.

The skill bar ramp used to do exactly that:

```
  band 2 → --brass   default: tan    ✓ orange   new-year: ice grey ✗   halloween: purple ✗
  band 6 → --cta     default: violet ✓          new-year: cyan     ✗   halloween: orange ✗
```

The ramp only ever read correctly in the default theme, by coincidence of that palette. It now uses
`--skill-ramp-1` … `--skill-ramp-6` in `:root`, outside the themeable palette, so no theme can reorder it.

Same rule for `--danger` / `--warning` / `--info` / `--success`: a theme may retune them for legibility on its own
surfaces, but must not repurpose them. A theme that leaves them unset inherits the industrial defaults — which is
how New Year ended up with hazard-yellow and fire-engine-red bars on an ice palette.

### Adding or finishing a theme

1. Add the months to `app/consts/THEME_MONTHS.ts`. Invalid or double-assigned months resolve to the default theme.
2. Add `app/styles/theme-<name>.css` and import it last in `app/layout.tsx`.
3. Fill the **token block** first. Re-check the page — most surfaces are already done.
4. Add a `.theme-backdrop-<name>` and register it in the `theme-core.css` visibility rule.
5. Only now write component overrides, for shape work outside the token set.
6. Pause any decorative animation under `body.modal-open`, and disable it under `prefers-reduced-motion`.
   A theme-scoped animation outranks the shared guards in `globals.css`, so it needs its own copy of both.

### Is the theme finished?

Walk the page and look for these. Each one is Crazy Mechanics vocabulary surviving into another theme:

- rivets or fastener dots in panel corners
- `repeating-linear-gradient` stripe layers in a background token — that is rolled or brushed sheet metal
- diagonal hazard tape
- gears
- labels tilted a fraction of a degree
- brushed-chrome nameplates with a hard bevel
- steel / brass / workshop-brick colour surviving in a theme that has no workshop

Then confirm: `pnpm lint`, `npx tsc --noEmit`, `git diff --check`, and
`document.body.scrollWidth === document.documentElement.clientWidth` at 390, 624 and 1440 px.
