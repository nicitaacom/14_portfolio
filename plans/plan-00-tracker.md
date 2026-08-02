# plan-00 — tracker

Branch: `ui/crazy-mechanics` (off `production`)
Law: [dev_readme-ui-it-worked.md](../dev_readme-ui-it-worked.md) — materials drawn, one lamp, box in box, lever rules
Halloween law: [dev_readme-ui-halloween.md](../dev_readme-ui-halloween.md) — graveyard, crypt, thorn, web, and skeleton-hand rules
Seed: [app/components/Projects/NDAProjectPreview.tsx](../app/components/Projects/NDAProjectPreview.tsx)

**This file is the ONLY status board. Every plan-NN links back here.**

## Statuses

`todo` → `planned` (sheet written, waiting approval) → `approved` → `built` (diff shown, waiting review) → `done` (committed)

## Task board — order 1–3 fixed by Nikita, 4+ is a proposal awaiting reorder

| #   | Task                                                | Surface (vibes doc word)                           | Plan file                                                | Status                            |
| --- | --------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | --------------------------------- |

**Reorder note:** Nikita moved the workbench wall to slot 02 (was proposal 05) — background lands before modal and Project card. Tasks 05–11 still wait for his ordering before any plan-05 sheet is written (decision №4).

**Loop periods taken:** 5 / 5.8 / 7 / 9 / 12 (seed) + 10.5 + 8 (task 01 rail + status pulse) + 6.3 (task 02 wall). Any new loop drifts against all of these.

## Proposed order logic for 05–11 (one line each, for the reorder call)

- 05 Button early: plaques appear inside every later surface, cheapest shared win
- 06 Lever + 07 Gearset together: gearset turns during the lever's held window (§3.4)
- 08–09 are leaf polish, safe anywhere after 05
- 10 Counters extends task 01's rail — any slot after 01
- 11 last: new surfaces, nothing depends on them

## Decisions already made — locked, never re-opened

1. Rollout: one task at a time, STOP after each, Nikita corrects direction
2. Style: wooden violet old-modern retro COMBO — old materials under modern `--cta` light, body type Inter
3. Lever: normal button silhouette, the ICON inside travels the gate / clunks / holds / springs back. One lever per page
4. Order: component-by-component — navbar, modal, Project, then reorder

## Hard rules (checked on every diff)

- Pattern fidelity: every material copies its `public/UI/` shot strictly — the shot IS the spec (Nikita, after task-01 review). Flat single-opacity surfaces = wrong; per-element tone variation, mortar/groove depth, turbulence grain = right
- Tooling: svg + canvas + framer-motion + gsap all authorized, each in its lane (plan-02 §10.3) — svg draws materials, canvas draws sin/cos motion, framer answers the visitor, gsap runs timelines; all obey modal-open pause + reduced-motion
- Materials drawn: gradients / SVG patterns only, zero raster texture files
- One lamp, shadows straight down, top edges brighter than bottom
- box in box: board → panel → bezel → content, alternate materials, max 4 deep
- New idle loop periods drift against 5 / 5.8 / 7 / 9 / 12s — never a multiple or match
- Every loop pauses on `body.modal-open`, off under `prefers-reduced-motion`
- Done per task = shadows down + top edges brighter + light pool tracks the lamp + every control ≥ two boxes deep

## Shared step folded into task 01

Material tokens from vibes doc §1.4 (`--steel`, `--steel-deep`, `--wood`, `--brass`, `--paper`, `--blueprint`) land in task 01 step 1 — the navbar is the first surface that needs them, and every later task reads them from `globals.css` + `tailwind.config.ts`.
