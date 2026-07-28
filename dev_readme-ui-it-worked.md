## UI description

From game "it worked" "Crazy Machines" "Заработало!"

## UI vibes

- old
- box in box
- pull leaver as car transmission to send API req

---

### 0. Why this doc exists

The portfolio today is a flat dark page with purple outline buttons. Every block looks like every other
block, so nothing tells the visitor _where_ they are or _what kind_ of thing they are reading.

The game solves that with **materials and machines**. In "Заработало!" you know what a thing is before
you read it: a stone plaque is something you press, a wooden board with a paper tab is the game talking
to you, aged paper is a reward, graph paper is a plan, a green CRT is live data, yellow-black stripes are
a warning, and a lever is something you pull to make the machine run. The reader learns the parts once,
then never needs a label again.

This doc pins those parts for the portfolio so a build session picks a surface instead of inventing one.
It describes the target vibe only — nothing is built from it yet. Plan files come next.

---

### 1. How does it look like?

#### 1.1 The three vibes, unpacked

**old** — everything has been in this workshop for twenty years. Metal is scratched and dull, not chrome.
Wood is scuffed at the corners. Paper is yellowed with torn edges. Labels are masking tape with
handwriting, taped on slightly crooked. Nothing is pristine, nothing is glossy, nothing floats on a
neutral white grid. Edges are worn round by use, not by a `border-radius` decision.

**box in box** — no control sits directly on the page. It sits in a bezel, the bezel sits in a panel, the
panel is screwed to a board, the board hangs on the wall. Look at
[crazy-mechanics-aside.png](public/UI/crazy-mechanics/crazy-mechanics-aside.png): the green scope is inside a bolted brass
ring, inside a wooden panel, inside a steel bracket, inside the rack column. Four frames deep before you
reach the data. That nesting is what makes it read as built rather than laid out.

**pull leaver as car transmission to send API req** — the big actions are not buttons, they are machine
controls. Sending a form means grabbing a gear-shift lever and pulling it through its gate until it
clunks into place. The request runs while the lever is down; the lever springs back when the answer
lands. Small actions stay plaques. The one action that matters on a page gets the lever.

#### 1.2 Reference shots — what to take from each

| Shot                                                                                         | The vibe in one line                                                                                                                                    | What we take                                                                                            |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [crazy-mechanics-loading.jpg](public/UI/crazy-mechanics/crazy-mechanics-loading.jpg)         | Black room, one lit brick wall, a torn blueprint sheet with hand sketches and margin math, three gears turning below                                    | Loader, hero backdrop, the "torn sheet taped to a wall" framing, margin doodles as texture              |
| [crazy-mechanics-main.jpg](public/UI/crazy-mechanics/crazy-mechanics-main.jpg)               | The workbench — parts laid on a plaster wall, long soft shadows, blue cables, hazard rail with odometer counters at the bottom, steel rack on the right | Page layout: open work surface + bottom status rail + right rack. Shadow language. Cables as connectors |
| [crazy-mechanics-menu.png](public/UI/crazy-mechanics/crazy-mechanics-menu.png)               | Riveted plate wall, pipes running off-screen, buttons are stone plaques with engraved colored labels                                                    | Plaque = button. Nav as scattered plaques, not a row. Pipes and gears bleeding past the edge            |
| [crazy-mechanics-aside.png](public/UI/crazy-mechanics/crazy-mechanics-aside.png)             | The rack: steel bracket, wood panel, green oscilloscope in a bolted bezel, masking-tape label reading "Monitor 3", hazard triangle, brass knobs         | **box in box** in its purest form. Screws at panel corners. Handwritten tape labels. Live green readout |
| [crazy-mechanics-modal.png](public/UI/crazy-mechanics/crazy-mechanics-modal.png)             | Small wooden dialog inside a rounded steel pipe frame, paper strip tab for the title, three glass buttons                                               | Modal recipe: pipe frame + wood body + paper title tab, heavy shadow under it                           |
| [crazy-mechanics-certificate.png](public/UI/crazy-mechanics/crazy-mechanics-certificate.png) | Aged paper with torn edges, blackletter title, typewriter body, rubber stamp seal bottom-right                                                          | **old** at full strength. The award/testimonial surface. Stamp as the "verified" mark                   |

#### 1.3 The seed we already ship

One piece of this already lives in the repo, and it sets the rules for the rest:

- [app/components/Projects/NDAProjectPreview.tsx](app/components/Projects/NDAProjectPreview.tsx) — a lamp
  hanging on a cable, swinging over a brick wall, lighting a riveted metal panel. Pure SVG, no image files.
- [app/globals.css:210-310](app/globals.css) — the four loops (`nda-lamp-swing`, `nda-lamp-flicker`,
  `nda-email-angle`, `nda-panel-lap`), the pause on `body.modal-open`, and the `prefers-reduced-motion` opt-out.

Two facts to copy from it, not re-decide:

1. **Every material is drawn, not photographed.** Metal is a `linearGradient`, bricks are a `pattern`, the
   light pool is a `mask` + `radialGradient`. Nothing is a PNG skin. That is why it stays sharp at any
   zoom, recolors from tokens, and weighs nothing.
2. **The light is purple, not tungsten.** The game's lamp is warm yellow; ours runs on `--cta`
   (277° 100% 68%). The materials are the game's; the light falling on them is the portfolio's.

#### 1.4 Palette — what exists, what is missing

Already in [app/globals.css:7-20](app/globals.css), and it already covers every _signal_ part of the game:

| Token                  | Value        | Workshop part it plays                                  |
| ---------------------- | ------------ | ------------------------------------------------------- |
| `--primary`            | 0 0% 13%     | The dark room the workshop sits in                      |
| `--primary-foreground` | 0 0% 19%     | Panel face lifted off the wall                          |
| `--secondary`          | 0 0% 87%     | Engraved label text, headings                           |
| `--cta`                | 277 100% 68% | The lamp, the rim light, the glow. The one light source |
| `--warning`            | 47 100% 50%  | Hazard triangle, the striped rail                       |
| `--success`            | 118 79% 44%  | The green oscilloscope trace                            |
| `--danger`             | 0 84% 48%    | The red painted plate                                   |
| `--info`               | 207 62% 51%  | The blue cables                                         |

The signals are done. What the workshop still wants is **material** tokens — proposal for the plan to
pin, values read off the reference shots and off the gradients already inside `NDAProjectPreview`:

| Proposed token | Value       | Reads as                                           |
| -------------- | ----------- | -------------------------------------------------- |
| `--steel`      | 276 10% 22% | Panel face (`#38323F`, already in the seed)        |
| `--steel-deep` | 270 21% 9%  | Panel shadow side (`#17131D`, already in the seed) |
| `--wood`       | 28 25% 22%  | Modal body, the board a rack hangs on              |
| `--brass`      | 40 45% 55%  | Screws, knobs, bezel rings, the lever ball         |
| `--paper`      | 38 40% 88%  | Certificate, tape labels                           |
| `--blueprint`  | 210 25% 30% | Graph-paper grid for plans and sketches            |

#### 1.5 Where each surface lands

```
app/
├── components/
│   ├── Button.tsx                       → PLAQUE       (today: 1px purple outline, rounded)
│   ├── Input.tsx                        → BEZEL        (recessed slot, screws, tape label above)
│   ├── Modals/ModalContainer.tsx        → PIPE FRAME + WOOD BODY + PAPER TAB
│   ├── Modals/ScheduleAppointment/*     → LEVER        (booking = the one big pull)
│   ├── Navbar/Navbar.tsx                → HAZARD RAIL  (striped edge, counters)
│   ├── Navbar/ProgressBorder.tsx        → PANEL LAP    (running dash — already the right idea)
│   ├── LoadingSpinner.tsx               → GEARSET      (three meshed gears)
│   ├── Skill.tsx                        → TAPE LABEL   (handwriting on masking tape)
│   ├── Project/Project.tsx              → PANEL        (screwed at four corners, on the workbench)
│   ├── Projects/NDAProjectPreview.tsx   → LAMP         ✅ built, the reference
│   └── Tooltips/*                       → TAPE LABEL   (small, tilted, hand-written)
└── [locale]/(site)/
    ├── page                             → WORKBENCH    (wall + one light pool)
    ├── appointment                      → LEVER        (submit = pull through the gate)
    └── admin-dashboard                  → RACK         (CRT readouts, knobs, hazard triangle)
```

---

### 2. Terminology

Use these words in plans, commits and file names. One word per part, so a build sheet can say "put it on
a plaque" or "that submit is a lever" and nothing is left to guess.

| Word            | What it means                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| **Workbench**   | The page itself: dark wall, one pool of purple light, things laid on it with shadows under them      |
| **Lamp**        | The single light source hanging from the top on a cable. It swings, so the light pool swings with it |
| **Board**       | The outermost box. Wood or plate, hangs on the wall, holds panels                                    |
| **Panel**       | A framed module screwed to a board. Metal face, rim light on the lit edge, four corner screws        |
| **Bezel**       | The innermost box. A ring or slot holding one control or readout                                     |
| **Plaque**      | A button. Stone plate, rivets, engraved label. Pressing it sinks it 1px                              |
| **Lever**       | The gear-shift control. Pull it through its gate to fire the request. See §3.4                       |
| **Gate**        | The slotted track the lever travels in, with the notch it clunks into at the end                     |
| **Rack**        | The vertical column of panels down one side (aside). Readouts, knobs, warnings                       |
| **Pipe frame**  | The rounded tube border around a modal, with joints at the corners                                   |
| **Paper tab**   | The strip of paper laid over the top edge of a modal, holding its title                              |
| **Tape label**  | Masking tape with handwriting on it, tilted a degree or two. Names small things                      |
| **Blueprint**   | Graph-paper surface with sketch lines and margin math. Holds plans, diagrams, "how it works"         |
| **Certificate** | Aged paper, torn edges, stamp. Holds awards, testimonials, results                                   |
| **Hazard rail** | Yellow-black striped strip along an edge. Status, warnings, counters                                 |
| **Counter**     | Odometer digits that roll. Any number that climbs (projects shipped, visits, years)                  |
| **Gearset**     | Three meshed gears turning. The loader                                                               |
| **Cable**       | A hanging line that connects two things and sags slightly                                            |
| **Rivet**       | The round dot at a panel corner. Light on its top edge, dark on its bottom edge                      |

---

### 3. How it works

#### 3.1 One light, one shadow direction

The whole page is lit by the Lamp and nothing else. That single rule buys the game's look for free: every
shadow points the same way, every top edge is brighter than its bottom edge.

```
                        ● lamp anchor (top centre)
                        │
                        │  cable
                        │
                       ╱█╲              ← bulb, purple glow
                     ╱   │   ╲
                  ╱      │      ╲       ← light pool, widens downward
               ╱         │         ╲
    ┌────────╱───────────┴───────────╲────────┐
    │  ░░░░░░  lit zone  ░░░░░░░░░░░░░░░░░░░  │   inside the pool: rim light on top
    │      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │   edges, bricks faintly purple
    │  outside the pool: material only, flat  │
    └────────────────────────────────────────┘
              shadows fall straight down — dy 12, blur 12, black 0.75
```

The Lamp swings, so the lit zone slides left and right under it. Panels hold still; the light across them
moves. That is the whole trick behind
[`nda-moving-light-zone`](app/components/Projects/NDAProjectPreview.tsx:62).

#### 3.2 box in box — the nesting rule

Four frames from wall to data, and each frame is a different material. The same material twice in a row
makes the nesting vanish, so alternate.

```
BOARD ─ wood, hangs on the wall, casts the big shadow
  └── PANEL ─ steel face, rim light on top, screw at each corner
        └── BEZEL ─ brass ring or recessed slot, dark inset edge
              └── CONTENT ─ green trace, digits, text, input
                    └── TAPE LABEL ─ taped across the bottom edge, crooked

  ╔═════════════════════════════════════╗  board (wood)
  ║  ◉───────────────────────────────◉  ║  screws
  ║  │ ███████████████████████████████│  ║  panel (steel, lit at top)
  ║  │ █  ╭───────────────────────╮  █│  ║
  ║  │ █  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  █│  ║  bezel (brass ring)
  ║  │ █  │ ▓  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  ▓ │  █│  ║  content (green trace)
  ║  │ █  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  █│  ║
  ║  │ █  ╰───────────────────────╯  █│  ║
  ║  │ █      ┌ Monitor 3 ┐          █│  ║  tape label, tilted −2deg
  ║  ◉───────────────────────────────◉  ║
  ╚═════════════════════════════════════╝
     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       shadow, straight down
```

Depth is what sells it, and depth is cheap: each frame is one inset shadow on its inner edge plus one
highlight on its top edge. Nothing here needs a 3D transform.

#### 3.3 Layer stack of any panel

Same six layers every time, bottom to top:

```
6  ▸ screws          4 rivets, one per corner
5  ▸ content         text / icon / readout / bezel
4  ▸ inner edge      1px dark inset, so the face looks recessed
3  ▸ rim light       gradient stroke, bright where the lamp is, fading away from it
2  ▸ face            steel gradient, light at top-left → deep at bottom-right
1  ▸ drop shadow     dy 12, blur 12, black 0.75 — lifts it off the board
0  ▸ workbench       wall
```

#### 3.4 The lever — a request you can feel

One lever per page, on the action that matters (send booking, submit form, run search). Everything else
stays a plaque. It is a car gear-shift: a knob on a stick, travelling down a slotted gate into a notch.

```
IDLE                 PULLING (drag/hold)      SENT (request running)    LANDED
                                                                          ↑ springs back
   ●  knob              ●                          ╷                      ●
   │                     ╲                         ╷                      │
   │  stick               ╲                        ╷                      │
 ╭─┴─╮ gate            ╭───╲─╮                  ╭──●──╮                 ╭─┴─╮
 │ ▓ │                 │ ▓  ╲│                  │ ▓▓▓ │                 │ ▓ │
 │ ▓ │                 │ ▓   │                  │ ▓▓▓ │                 │ ▓ │
 ╰───╯ notch           ╰─────╯                  ╰──◉──╯ clunk           ╰───╯
 rest position         resists, gate lights     held down while the      gate flashes green,
 faint hum             up along the travel      gearset turns beside it  knob returns in 400ms
```

Rules that keep it honest:

- The lever moves under the pointer, so the pull is a real drag, not a click with decoration. Keyboard
  gets the same thing: `Space` or `Enter` runs the travel and fires at the notch.
- The request fires **at the notch**, once. Letting go before the notch springs it back with nothing sent.
- The held-down state lasts exactly as long as the request. The gearset beside it turns for the same
  window, so two parts of the machine agree.
- Answer landed → gate flashes `--success` and the knob returns. Answer refused → gate flashes `--danger`,
  the knob snaps back hard, and a tape label appears under it with the reason.
- Touch screens get a shorter gate, thumb-sized knob, same behaviour.

#### 3.5 Motion contract

Nothing on the page is fully still, and nothing is fast. The workshop idles.

| Loop            | Period | Curve       | What moves                      |
| --------------- | ------ | ----------- | ------------------------------- |
| Lamp swing      | 5.0s   | ease-in-out | Physical pendulum, so it eases  |
| Email angle     | 5.0s   | ease-in-out | Faint background icon breathing |
| Lamp glow       | 5.8s   | linear      | Electrical flicker, so it steps |
| Beam flicker    | 7.0s   | linear      | Same flicker, reversed          |
| Panel lap       | 9.0s   | linear      | A dash running the panel border |
| Gearset _(new)_ | 12.0s  | linear      | Loader rotation                 |

The rule behind the odd numbers: **no two periods line up.** 5 / 5.8 / 7 / 9 / 12 drift against each
other, so the composite never visibly repeats and the page reads as alive rather than looped. Any new loop
picks a period that keeps that drift.

Motion the visitor causes is the opposite — short and sharp, so it reads as _their_ doing:

```
plaque press     80ms   sink 1px, shadow shrinks
lever travel    240ms   follows the pointer, no easing of its own
lever return    400ms   ease-out with a small overshoot, like a spring
gate flash      600ms   colour in fast, out slow
tape label in   180ms   drops in with a 2deg wobble
```

Two hard stops, both already written in [app/globals.css:290-310](app/globals.css) and both kept for every
new loop:

```
body.modal-open        → animation-play-state: paused   (the room holds still while you read)
prefers-reduced-motion → animation: none                (static frame, full contrast, nothing lost —
                                                         the lever becomes a press-and-send)
```

#### 3.6 Which surface holds which content

The point of the material vocabulary is that the material answers "what is this?" before the words do.

```
"press me"             → PLAQUE        buttons, nav items, small actions
"pull me, this is THE  → LEVER         booking submit, contact send, run search
 action on this page"
"the machine is on"    → PANEL         project cards, sections, forms
"a number is climbing" → COUNTER       stats, visits, years shipped
"live values"          → CRT readout   admin dashboard, analytics
"here is the plan"     → BLUEPRINT     how-it-works, architecture, process
"you earned this"      → CERTIFICATE   testimonials, awards, results
"careful / status"     → HAZARD RAIL   errors, offline, rate limits
"what is this knob?"   → TAPE LABEL    tooltips, skill names, small captions
"the workshop speaks"  → PIPE + WOOD   modals, dialogs
"still working…"       → GEARSET       loaders
```

Worked example — a project card today vs. on the workbench:

```
BEFORE                              AFTER
┌──────────────────────┐            ╔══◉══════════════════◉══╗   ← screws, rim light on top edge
│ Project 23           │            ║  Project 23            ║
│ store, next, supabase│            ║  ┌──────────────────┐  ║   ← bezel, recessed
│ [ Live ] [ GitHub ]  │            ║  │ store · next · sb│  ║
└──────────────────────┘            ║  └──────────────────┘  ║
 flat, 1px purple outline           ║  ▟ Live ▙   ▟ GitHub ▙ ║   ← plaques, engraved labels
                                    ╚══◉══════════════════◉══╝
                                       ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       ← shadow straight down
```

---

### 4. TODO

Nothing is built from this doc yet. Order of work, cheapest and most visible first:

| #   | Task                                                                                                   | Touches                                 |
| --- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| 1   | Add the six material tokens from §1.4 plus a `--shadow-lamp` token                                     | `app/globals.css`, `tailwind.config.ts` |
| 2   | Panel recipe as a CSS component class, proved on one project card                                      | `app/globals.css`, `Project.tsx`        |
| 3   | Plaque recipe applied to `Button.tsx`, with the press-sink state                                       | `Button.tsx`                            |
| 4   | Workbench background: wall + swinging light pool lifted out of `NDAProjectPreview` into a shared layer | `Layout.tsx`                            |
| 5   | **Lever** — pointer drag, keyboard travel, notch fire, spring return, gate flash                       | new component + `ScheduleAppointment`   |
| 6   | Gearset loader replacing the spinner, wired to the lever's held-down window                            | `LoadingSpinner.tsx`                    |
| 7   | Bezel recipe for `Input.tsx`, tape label above each field                                              | `Input.tsx`                             |
| 8   | Tape label recipe for tooltips and skills                                                              | `Tooltips/*`, `Skill.tsx`               |
| 9   | Pipe frame + paper tab modal                                                                           | `Modals/ModalContainer.tsx`             |
| 10  | Hazard rail + counters                                                                                 | `Navbar.tsx`                            |
| 11  | Blueprint and certificate surfaces                                                                     | new                                     |

**Reproduction for every step:** open the page, screenshot it next to the matching shot in `public/UI/`,
and check four things — shadows all point down, top edges are brighter than bottom edges, the light pool
tracks the lamp, and every control sits at least two boxes deep.

#### Decisions made AGAINST

| Decision                                                          | Why                                                                                                                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Against raster texture files** (wood.jpg, metal.png, brick.png) | The seed proves gradients and patterns do it: they recolor from tokens, stay sharp at any zoom, and add zero download. Image skins freeze the colour into the file and go soft on retina. |
| **Against warm tungsten light**                                   | The game's lamp is yellow. Ours stays `--cta` purple, so the workshop reads as this portfolio and not as fan art.                                                                         |
| **Against texture behind body text**                              | Wood grain under a paragraph costs contrast. Text sits on a flat face inside the bezel; the material lives on the frames, edges and corners.                                              |
| **Against skeuomorphic body type**                                | Body copy stays Inter. Blackletter and typewriter faces are for the certificate title and tape labels only — one or two words at a time.                                                  |
| **Against more than one lever per page**                          | The lever means "this is the action". Two levers and it means nothing, and the pull becomes a chore on the one that matters.                                                              |
| **Against the lever for anything reversible**                     | Filters, tabs, sort order and nav stay plaques. A pull is for something that leaves the page and reaches a server.                                                                        |
| **Against a physics engine for the swing**                        | Four CSS keyframes already sell the pendulum. A library to move one lamp is weight with nothing to show for it.                                                                           |
| **Against per-component light direction**                         | One lamp, one shadow direction, page-wide. The moment two blocks disagree about where the light is, the illusion drops.                                                                   |
| **Against nesting deeper than four boxes**                        | Board → panel → bezel → content is the depth the reference shots use. A fifth frame eats the content area on a phone and reads as noise.                                                  |
| **Against idle loops faster than ~4s or slower than ~12s**        | Faster reads as a fidget, slower reads as broken. The idle band is 4–12s.                                                                                                                 |
