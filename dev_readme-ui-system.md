# UI system

### Why this exists

A seasonal theme here is a **complete UI system**, not a recolour of Crazy Mechanics.

This file is the contract for that system. It is deliberately **not** a per-theme document — there is no
`dev_readme-ui-<theme>.md` for every theme. `dev_readme-ui-halloween.md` exists only because Halloween ships
extra bespoke components (scene, grave event, skeleton lever) that need their own notes. The system itself —
how a theme is built, what a theme owns, when a theme is finished — lives here and applies to all of them.

The failure this prevents: a theme that only remaps colour variables. It keeps every rivet, every brushed-metal
stripe, every gear and every crooked workshop label from Crazy Mechanics, and reads as Crazy Mechanics wearing a
different palette. New Year was in exactly that state — 3 component overrides against Halloween's 112. It now
ships 73 theme-scoped overrides, its own material vocabulary and five bespoke components; see
`dev_readme-ui-new-year.md`, the second theme to earn its own notes.

### The three layers

```
  app/styles/theme-core.css          shared surfaces; every value is var(--theme-*)
        ▲                            .workbench-board .machine-panel .plaque .tape-label ...
        │ reads
        │
  :root[data-theme="new-year"]  ──►  --theme-panel-background: <watercolour wash>
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

| Token                                  | Drives                                                                                  | Set it to 0 / none when         |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| `--theme-fastener-opacity`             | `.navbar-rivet`, `.machine-panel::before`, `.project-wood-body::before`                 | the theme has no rivets         |
| `--theme-hardware-opacity`             | `.navbar-plate::before`, `.lever-gate::before`, `.modal-frame-hardware`                 | the theme has no bevel hardware |
| `--theme-label-rotation`               | `.tape-label`, `.paper-tab`, `.modal-title-label`, tooltips                             | labels are not stuck-on tape    |
| `--theme-radius`                       | every themed surface                                                                    | —                               |
| `--theme-trim` / `--theme-trim-strong` | borders across all surfaces                                                             | —                               |
| `--theme-*-background`                 | board, panel, inset, control, label, frame, project, input, modal, appointment surfaces | —                               |

Halloween and New Year both set the first three to `0` / `0deg`. Crazy Mechanics is the only theme that wants
rivets and tilted labels — they are its signature, not a shared default.

### Decisions made AGAINST

- **Against per-theme docs.** One system contract, not N skin files. Only bespoke component sets earn their own doc.
- **Against a `halloween:` / `new-year:` Tailwind variant.** No theme variant exists in `tailwind.config.ts` and no
  JSX uses one. Theme overrides live in the theme CSS files. A utility class is specificity `(0,1,0)` and loses to
  `:root[data-theme="x"] .y` at `(0,3,0)`, so a variant would need `!important` on every class.
- **Against material tokens standing in for semantic scales.** See below — this was a real bug.
- **Against raster art for theme _ornaments_.** Anything that behaves — a control, a scene, an event, a spinner —
  is CSS, SVG, Canvas, Framer Motion, GSAP, never a bitmap. Flat editorial artwork is a separate case: New Year
  ships a strip of the reference photographs as a deliberate design element, and that is fine. The line is that a
  photograph may illustrate, but it may never stand in for a component that has states.

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

`--cta` is the case where the material/semantic split bites hardest, because theme-core uses it as **both** a
surface (control faces, trim, arrows) and an accent. A saturated dark material makes a good fill and a poor text
colour: New Year's crimson `#da1b2e` measures 7.7:1 under warm-snow label text and 2.8:1 as text on the panel wash,
and no dark background can lift it past 4.18:1. `--cta-text` therefore aliases `--cta` by default and may be
overridden by a theme for small accent text. New Year keeps the sampled crimson surface and sets a lighter
`--cta-text`. Check the text token separately from every fill.

### Never set `position` unconditionally in a theme file

These files are unlayered, so every declaration in them outranks anything Tailwind emits inside `@layer utilities`.
For colour that is the whole point. For `position` it is a trap: a bare

```
  :root[data-theme="x"] .machine-face { position: relative; }
```

beats the `absolute` utility on `<div class="machine-face absolute ...">` and drags that element back into normal
flow. In New Year this inflated the navbar bezel around the language menu from 44px to 280px, and it also caught a
`laptop:sticky` board and a `plaque absolute` control in a modal — the element still looks right in isolation, so the
damage shows up as a container that is suddenly the wrong size somewhere else.

If a theme needs a positioned box — for a `::after` ornament, or to anchor an absolutely-positioned child — put the
`position` in its own rule and exclude anything a utility already positions:

```
  :root[data-theme="x"] .workbench-board:not([class*="absolute"]):not([class*="fixed"]):not([class*="sticky"]) {
    position: relative;
  }
```

The substring form is deliberate: it also catches responsive variants such as `laptop:sticky`, which a bare
`:not(.sticky)` would miss. The same caution applies to `display`, `overflow` and `z-index`.

### Measuring contrast on a theme

Eyeballing a gradient does not work, and neither does computing a ratio from the token values: a wash of layered
radials plus a grain tile sits far above its own darkest stop, so a colour chosen against the base measures much
worse where it actually lands. New Year's panel median came out roughly four times the luminance of its base pine.

Measure the painted pixels instead. What worked, with no dev server involved:

1. Render one surface at a time, filling a fixed box, with the theme CSS linked and `data-theme` stamped on `:root`.
2. Screenshot it in headless Chromium at a known window size.
3. Decode the PNG and sample a grid inside the box, asserting that no page background leaks into the window — a
   viewport shorter than the image will otherwise feed it background pixels and quietly flatter the result.
4. Report the median and the brightest 5%, and test every text and glyph pair against both.

Skip the top edge band if the theme dusts snow or a highlight along it; that is decoration, not a text substrate.

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
- `repeating-linear-gradient` stripe layers in a background token — that is rolled or brushed sheet metal, unless
  the theme's own material genuinely repeats (New Year's knit and gingham do, and say so in a comment)
- diagonal hazard tape
- gears
- labels tilted a fraction of a degree
- brushed-chrome nameplates with a hard bevel
- steel / brass / workshop-brick colour surviving in a theme that has no workshop

Bespoke components are what separates a system from a skin. The set worth having, both themes that have gone the
distance ship all of it: a backdrop scene, a control ornament on the request button, a per-card ornament, a
replacement for the booking-wait scene, and a random ambient event. Every one of them needs its own copy of the
`body.modal-open` and `prefers-reduced-motion` guards, and a `gsap.context()` or a cancelled frame loop on unmount.
The one exception is a scene rendered _inside_ a modal — the booking wait — which must not test `modal-open` at
all, since that class is set for the whole time it is on screen.

Then confirm: `pnpm lint`, `npx tsc --noEmit`, `git diff --check`, and
`document.body.scrollWidth === document.documentElement.clientWidth` at 390, 624 and 1440 px.
Also visit the home, appointment, authentication, admin and not-found routes. A complete system
must cover navigation, footer, modal, picker, toast, empty and loading states rather than ending
at the primary page.
