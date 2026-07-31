## UI description

This is a complete New Year UI system, not a colour skin over the default interface.

The app is a quiet winter night outside and a warm holiday room inside. Midnight-blue glass and
snow frame the workspace; pine fabric, crimson velvet, candlelight and photographic holiday
objects make the content feel warm and lived-in. Snow must obey gravity: it settles on borders,
ledges and lettering instead of falling upward or appearing as a transparent overlay.

Use decoration as part of the component composition:

- Project frames carry one dense, even layer of settled Canvas snow on all four sides, with
  icicles only along the top.
- Project modal headers use an irregular Canvas snow cloud, dense on the left and thinning into
  a differently seeded jagged edge in every modal. The name is carved through it like a finger
  dragged through snow.
- `new-year-2026.jpeg` is composed across the header rather than stretched once. An absolute
  full-header layer uses `::before` and `::after` with `background-size: 335% 100%`: the left
  pseudo-element shows and stretches the photograph's piled-snow third, while the right one does
  the same with its smooth-snow third. A separate 137px-wide, full-height center child renders the
  complete undistorted greeting. It is skewed `-3deg`, dimmed/desaturated, and masked to transparent
  at both edges. Two center pseudo-layers provide a faint blurred copy and a sharper low-opacity
  copy, each with its own wider gradient mask. The side regions overlap the center by 30px and use
  260px pixel-based feather masks; the white underlay fades across a 680px span. These long transitions
  avoid viewport-dependent seams. The Canvas snow-name field and link remain above the photograph via
  `z-index`; the art extends beneath the bell padding.
- Modal photography belongs to deliberate surfaces: gifts/tree is clipped inside Project Task,
  fireplace inside Project Stack and coffee inside Deadline. The frosted fern photograph
  (`new-year-30.jpg`) covers the right 68% of the complete scrollable modal body behind the
  contribution content, with a left-edge mask; it does not belong inside Collaboration.
- The modal close control is a bell hanging directly below a smoking chimney. The chimney uses a
  tapered silhouette, softly staggered gray masonry, a dimensional open rim and snow cap; its lower
  bricks transition into frame blue so it appears to rise from the modal instead of sitting on it.
- Holiday cutouts sit deliberately at modal edges; they are never scattered across the global
  background.
- Motion is tactile and finite: ornaments swing on hover or click, the bell closes by pulling,
  and repeating navbar animation must loop without a visible restart.

All of these rules are scoped to `data-theme="new-year"`. Switching
`app/consts/THEME_MONTHS.ts` away from New Year restores the default UI.

## UI vibes

1. New Year's lo-fi
2. Christmas tree
3. Gifts in holiday boxes (e.g., sweets, new year clothing e.g sweater, tableware, or holiday-themed items like a candle, a festive print, or bath bombs)
4. Holiday clothing – socks, sweater, hat, etc.
5. Mandarins
6. Sweets – Kinder, Milka, Santa-shaped treats, holiday-themed coffee, hot chocolate, etc.
7. Holiday tableware – mug, plate, etc.
8. Warmth indoors while it’s cold and snowing outside
9. Browsing Pinterest for New Year's food, style, images, etc.
10. Candle
11. Movie and pizza
12. Holiday lights (indoor and outdoor)
13. Marshmallows and candy canes
14. Santa Claus and the Snow Maiden
15. New Year's update in _World of Tanks_
16. Snow
17. Frost
18. Fireplace
19. Jazz / holiday jazz
20. Snowman
21. Snowball fight with happy people
22. Red, green, white

---

## What the system is built from

Reference photographs live in `public/UI/new-year/references/`; transparent cut-outs live one
directory above them. The system uses the set in groups rather than treating one photograph as
a page mock-up:

- `2`, `34`–`37` establish the cold blue outdoor night.
- `1`, `9`, `10`, `21`, `22`, `31`–`33` establish the warm indoor light and quiet lo-fi mood.
- `5`–`13`, `19`, `20`, `25`, `27`, `28`, `38`, `39`, `41` establish textiles, wrapping and gifts.
- `3`, `4`, `14`–`18`, `23`, `40` establish the sweets and table still-life vocabulary.

Deep pine, warm snow and crimson come from the textile and illustration references. The sky is
the muted blue sampled from the winter-night reference: `#213b4e` through `#1a2e41` to
`#0f1e30`. Amber remains candlelight rather than becoming a fourth surface colour.

### Palette

| Role                                 | Value                               | Note                                                |
| ------------------------------------ | ----------------------------------- | --------------------------------------------------- |
| `--primary` / `--primary-foreground` | `162deg 54% 8%` / `162deg 40% 13%`  | deep pine                                           |
| `--secondary`                        | `40deg 30% 96%`                     | warm snow, never pure white                         |
| `--secondary-foreground`             | `150deg 12% 74%`                    |                                                     |
| `--cta`                              | `354deg 78% 48%`                    | crimson — a **surface** colour, see the limit below |
| `--cta-text`                         | `354deg 82% 68%`                    | lighter crimson for small accent text               |
| `--danger` / `--success`             | `354deg 86% 76%` / `150deg 48% 58%` | lifted for text on the wash                         |
| `--warning` / `--info`               | `38deg 94% 66%` / `196deg 46% 70%`  | amber candlelight / cold window                     |
| `--brass`                            | `40deg 46% 72%`                     | warm gold, the trim and the garland cord            |
| `--new-year-room`                    | `#0f1e30`                           | lower stop of the outdoor night                     |

Amber is the fourth colour. It is the third light source in nearly every photographic
reference, and it appears only as glow — bokeh, candle flames, bulbs, the loading pool. It is
never a surface fill.

Blue belongs to the exterior, frosted panes and recessed controls. It does not replace pine on
the warm interior surfaces.

### Material vocabulary

Crazy Mechanics is steel and brass, Halloween is stone and bone, this system is:

- **watercolour wash + paper grain** — panels, boards, modal surfaces. Wide soft-edged radials
  with no hard stop, then an inline `feTurbulence` tile over the top.
- **cable knit** (`--new-year-knit`) — the board. Two diagonals crossing at ±56deg.
- **red gingham** (`--new-year-gingham`) — every other gift tag.
- **snow crust / white fur** (`--new-year-crust`, `--new-year-fur`) — a soft snow lip on the top
  edge of raised surfaces and insets, a scalloped fur cuff on the bottom edge of the control.
  This replaces the machined bevel entirely.
- **frosted glass** — inputs and the lever gate.
- **cold blue glass** — pickers, recessed controls and the sky-facing side of the system.
- **crimson velvet** — the `.plaque` face, which every button in the app inherits.
- **paper gift tag** — labels, with a punched gold eyelet in the corner.

Knit and gingham are repeats on purpose. The warning in `dev_readme-ui-system.md` about
`repeating-linear-gradient` is about rolled sheet metal; wool and cotton genuinely are repeats.

### Components

| Component                     | Renders                      | Notes                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NewYearScene`                | the backdrop                 | Canvas snow in three parallax depths with two-period wind drift and an SVG snowfield (three banked drifts, two snowmen, snow-laden firs, a lit cottage and a light string of bulbs); the photographic cutouts belong to ModalMoreInfo rather than the global scene                                                                             |
| `NewYearFilmStrip`            | home and appointment         | Reference photographs cut into slanted panels with snow-white gaps. Each panel is skewed and its photograph skewed back by the same angle, so the cut is diagonal and the picture stays upright. `variant` picks the set: outdoors and people on home, indoors and treats on appointment. Uses direct image tags, not `next/image` — see below |
| `NewYearJazzPlayer`           | bottom-right, all pages      | SVG record and tone arm over a Canvas level meter. Click reveals the embedded lo-fi playlist and starts the disc turning — see the note below on why the embed is visible                                                                                                                                                                      |
| `NewYearRequestLever`         | buttons with `requestAction` | red-mittened hand on a candy-cane lever, pivots on its gate                                                                                                                                                                                                                                                                                    |
| `NewYearProjectOrnament`      | each project card            | bauble that swings on hover or click — no idle loop, so a page of cards costs nothing at rest                                                                                                                                                                                                                                                  |
| `NewYearProjectSnow`          | each project card            | One opaque Canvas-rendered snow coating around all four frame borders, with icicles hanging from the top bank; static because this is settled snow rather than weather                                                                                                                                                                         |
| `NewYearSnowParticleField`    | project modal heading        | Draws a deterministic snow cloud that fills the 64px header height, thins toward a differently seeded jagged right edge, and carves the accessible project name through it as handwritten negative space                                                                                                                                       |
| modal header photo layers     | project modal header         | Composes `new-year-2026.jpeg` from stretched left/right snow crops and one undistorted center greeting, using overlaps, long feather masks, a local white underlay and CSS blur/opacity layers                                                                                                                                                 |
| modal scroll photo layer      | project modal body           | Places `new-year-30.jpg` behind the right 68% of `.modal-scroll`; it is clipped by the scroll body, dimmed/desaturated and masked along its left edge while the content grid remains above it                                                                                                                                                  |
| `NewYearModalStillLife`       | project information modals   | Arranges socks, cinnamon coffee and mandarin cutouts at deliberate modal edges instead of scattering them across the global backdrop; Task, Stack and Deadline photography is supplied separately by theme-scoped card backgrounds                                                                                                             |
| `NewYearBookingLoadingScene`  | the booking wait             | snow globe: SVG dome and plinth, Canvas snow inside, GSAP rock-and-settle                                                                                                                                                                                                                                                                      |
| `NewYearFireworksEvent`       | randomly, over the town      | Canvas particles with gravity and drag, GSAP flash at each shell                                                                                                                                                                                                                                                                               |
| `NewYearAppointmentStillLife` | appointment introduction     | a CSS window and table using the existing gifts, coffee and mandarin cut-outs; it renders only for New Year                                                                                                                                                                                                                                    |
| navbar garland                | the repo strip               | a light string sagging across it, bulbs twinkling out of phase, parallax off the scroll position                                                                                                                                                                                                                                               |

`NewYearRequestLever` reuses the plumbing class names the Halloween hand introduced on the
button, and adds `new-year-request-control` / `new-year-request-content` beside them. Both sets
are theme-scoped, so only one is ever live.

### Complete system coverage

The visual rule is **cold New Year night outside, warm holiday room inside**. Route-level
composition and small system states follow the same rule:

| Area                     | New Year treatment                                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| shared shell             | blue winter scene behind a pine navbar and footer, snow-fur edges, paper labels and compact jazz player                                                                                                                |
| home introduction        | wrapped skill board, pine presentation panel, gift-tag accordion rows and the preserved chocolate-hand CTA                                                                                                             |
| work and projects        | velvet switcher controls and a midnight-blue frosted frame with Canvas snow settled on its horizontal ledges                                                                                                           |
| project modals           | midnight-blue glass workspace with a full-width layered snow header, carved snow-grain name, clipped card photography, frosted right-body artwork, icy borders, and a pull-bell beneath a blue-to-gray smoking chimney |
| it                       | ![alt text](image.png)                                                                                                                                                                                                 | appointment | indoor still life and photo strip above an advent-style paper calendar and invitation list |
| booking flow             | opened pine invitation with frosted blue fields and knitted summary cards                                                                                                                                              |
| authentication           | sealed pine invitation with a small crimson wax mark                                                                                                                                                                   |
| admin                    | dense pine work surface with blue recessed controls; data density and behaviour are unchanged                                                                                                                          |
| notices and empty states | warm paper gift tags with a status ribbon                                                                                                                                                                              |

Semantic hook classes in the React components describe the role of each surface. Their visual
rules live in `theme-new-year.css`; the hooks have no themed appearance outside
`:root[data-theme="new-year"]`. New Year-only illustration classes retain the
`new-year-` prefix and their components return `null` under every other theme.

### Where the backdrop is actually visible

Two things cost a first pass at this scene most of its artwork, both worth knowing before moving
anything in the viewBox:

- **The navbar plate covers the top of the scene.** At 1440x900 it takes the first ~280px, so
  anything above viewBox y≈300 is never seen. A set of fir boughs and six baubles were hung in
  the top corners and not one of them ever rendered on screen.
- **The bottom of the viewBox is cropped.** The backdrop is `100dvh`, which measured ~815px against
  a 900px viewBox, and `preserveAspectRatio="xMidYMax slice"` anchors the bottom — so the content
  is shifted up and viewBox y≈815–900 falls outside the box. Drifts may run to y=900 so no crop
  exposes an edge, but nothing that must be seen belongs below y≈800.
- **A phone-width viewport slices to the middle.** At 390px wide only viewBox x≈525–915 survives,
  so the snowmen sit near the centre rather than in the corners.

The usable band is roughly viewBox y 300–800, and the centre in x. Measure it rather than assume:
screenshot the running page, then read the pixel column at an x clear of the panels to find where
the backdrop starts and stops painting.

### The backdrop is visible but not hoverable

Being on screen and being reachable by a pointer are separate questions here, and the second one
has a site-wide answer: **a hover or click handler on anything inside the backdrop never fires.**

`app/[locale]/layout.tsx` puts the entire site's content inside one `.relative.z-10` div, and that
div's box spans the viewport at the default `pointer-events: auto`. The backdrop is behind it at
`z-index: 0`. Hit testing goes by boxes, not by painted pixels, so wherever page content leaves a
visual gap and the scene shows through, the content div's own empty box still takes the hit. Adding
`pointer-events: auto` to the target does nothing about this — the event stops before it gets there.

Making one genuinely hoverable means setting that div, `Layout`, `Footer` and the modal shell every
project modal shares to `pointer-events: none`, then re-opting-in every real control on the site.
That is a site-wide change that risks silently leaving a click target unreachable, so for
decorative motion it is not worth it.

What `NewYearScene` does instead, for the window-head baubles: a `pointermove` listener on `window`
compares the pointer against each ball's own circle and starts the swing on the crossing. The
geometry is resolved once per relayout through the root SVG's `getScreenCTM()`, not per move
through `getBoundingClientRect()` — the ball rides inside the group GSAP rotates, so a live rect
would drift with the swing it just started and retrigger itself, and it would force a reflow on
every mouse move. The backdrop is `fixed`, so a `ResizeObserver` is enough to keep it current.

The trade-off: the swing also fires when opaque content sits over a bauble, where it is hidden
anyway. Reach for this pattern for decorative motion in the backdrop, not for anything a visitor
has to be able to aim at.

### Contrast — measured, not estimated

Every pair below was measured off screenshots of the real painted CSS, sampling each surface on
a grid and taking the median and the brightest 5% of pixels. The rig lives in the session
scratchpad; the method is: render the surface full-viewport, screenshot it headless, decode the
PNG and compute the WCAG ratio per pixel.

The wash is what makes this hard. Layered radials plus a grain tile lift a surface well above
its darkest stop, so a colour picked against the pine base measures much worse in place. The
grain multiplier and the fir radial alphas are held down for exactly this reason — raising them
is a contrast regression, not a style tweak.

Current state: warm-snow body text 13.2:1, muted text 7.9:1, all four semantic colours between
6.3:1 and 8.7:1, the plaque label 7.7:1, tag ink 8.4:1. At the wash's brightest 5% the tightest
is 4.9:1, still clear of the floor.

### Why the jazz embed stays visible

The player streams a lo-fi playlist from an embedded frame rather than a file in `public/`. Two
constraints shaped it, and both are in the terms covering that embed:

- **The player may not be hidden**, and may not be shrunk below 200x200. So the record is a toggle
  that reveals a real player above it, not a control that pipes sound out of a frame nobody sees.
- **Audio may not be separated from the video.** Stripping the track out for audio-only playback,
  or proxying it, is not an option regardless of how it is implemented.

A knock-on effect: the frame is cross-origin, so its samples are not readable and there is no
analyser to attach. The level meter is therefore a synthetic level — three sine terms of different
periods so the row never marches in step — that moves while the player is open and settles to a low
idle wave when it is closed. It is decoration, not a reading of the audio, and the component says so.

If a licensed track ever lands in `public/`, an `<audio>` element with a real WebAudio analyser is
the better build and the meter can then show the actual signal.

### The photo strip uses direct image tags

`next/image` issued requests for only three of the six frames. The other three kept a correct `src`, a full
`srcset`, a real 254x230 layout box and `loading="eager"`, and were still never fetched — no request, no failure,
nothing in the network log. The files themselves are fine: all six return 200 raw and through the optimiser at
every width, and all six decode when opened directly. Something about `fill` inside a skewed, clipped panel loses
them. These are six fixed decorative photographs, so the optimiser buys almost nothing, and the direct tag is
reliable. The `@next/next/no-img-element` rule is suppressed on that one line with the reason written above it.

Reference photographs live in `public/UI/new-year/references/`. The cut-outs at `public/UI/new-year/` are separate
and are not used by the strip.

### Earlier component verification

These checks cover the original bespoke-component pass. Re-run the viewport checks after any
system-wide layout change:

| Check                                                                         | Result                                                                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `body.scrollWidth === documentElement.clientWidth` at 390 / 624 / 1440 / 1920 | passes at all four                                                                        |
| text running past the right edge at 390                                       | two project stack strings by 13px, both pre-existing content                              |
| snow canvas animates at rest                                                  | yes                                                                                       |
| snow canvas stops on `body.modal-open`, resumes on close                      | yes                                                                                       |
| snow canvas under `prefers-reduced-motion`                                    | frozen, but one still frame is drawn so snow is present                                   |
| jazz control label, `aria-pressed`, embed on click                            | labelled, toggles, reveals a 338x211 player on youtube-nocookie                           |
| `new-year:fireworks` test hook                                                | mounts the burst                                                                          |
| every New Year node unmounted under the other three themes                    | scene / jazz / lever / ornament all 0                                                     |
| panel background per theme                                                    | knit for New Year, green wash for Halloween, wood for Crazy Mechanics, violet for default |

The boxes that do extend past the right edge are the scene SVG (`preserveAspectRatio="slice"` is
meant to overhang) and the repo strip's drag scroller, both inside clipped containers, so neither
makes the page scroll sideways.

### Crimson surface and text split

`--cta` remains `#da1b2e` for velvet surfaces, progress fills and trim. Small `text-cta` labels
use `--cta-text` instead. The default value of `--cta-text` aliases `--cta`, so the split changes
only themes that opt into it; New Year sets it to the lighter `354deg 82% 68%`. This preserves
the sampled material colour without asking small text to use a colour that cannot meet its
contrast target on a dark wash.
