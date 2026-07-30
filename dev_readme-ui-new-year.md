## UI description

this is a new year UI system - not just theme of original UI system

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

Reference set is `public/UI/new-year/`. The two the palette comes from are `-38` and `-39`:
deep pine green, warm snow white, crimson, in a watercolour bleed with paper grain and bokeh.
`-41` and `-28` give the santa-hat cue that the primary control is built on, `-20` the red
gingham, `-1` and `-33` the lo-fi interior the backdrop scene is staged in.

### Palette

| Role                                 | Value                               | Note                                                |
| ------------------------------------ | ----------------------------------- | --------------------------------------------------- |
| `--primary` / `--primary-foreground` | `162deg 54% 8%` / `162deg 40% 13%`  | deep pine                                           |
| `--secondary`                        | `40deg 30% 96%`                     | warm snow, never pure white                         |
| `--secondary-foreground`             | `150deg 12% 74%`                    |                                                     |
| `--cta`                              | `354deg 78% 48%`                    | crimson — a **surface** colour, see the limit below |
| `--danger` / `--success`             | `354deg 86% 76%` / `150deg 48% 58%` | lifted for text on the wash                         |
| `--warning` / `--info`               | `38deg 94% 66%` / `196deg 46% 70%`  | amber candlelight / cold window                     |
| `--brass`                            | `40deg 46% 72%`                     | warm gold, the trim and the garland cord            |
| `--room`                             | `164deg 46% 4%`                     |                                                     |

Amber is the fourth colour. It is the third light source in nearly every photographic
reference, and it appears only as glow — bokeh, candle flames, bulbs, the loading pool. It is
never a surface fill.

`196deg` on `--info` is the only hue in the blue range anywhere in the theme, and it earns its
place as the cold light through the window glass.

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
- **crimson velvet** — the `.plaque` face, which every button in the app inherits.
- **paper gift tag** — labels, with a punched gold eyelet in the corner.

Knit and gingham are repeats on purpose. The warning in `dev_readme-ui-system.md` about
`repeating-linear-gradient` is about rolled sheet metal; wool and cotton genuinely are repeats.

### Components

| Component                    | Renders                      | Notes                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NewYearScene`               | the backdrop                 | Canvas snow in three parallax depths with two-period wind drift, SVG snowfield (three banked drifts, two snowmen, snow-laden firs, a lit cottage, chocolate and a steaming mug, a light string of bulbs), GSAP bauble sway, steam and bokeh                                                                                                    |
| `NewYearFilmStrip`           | home and appointment         | Reference photographs cut into slanted panels with snow-white gaps. Each panel is skewed and its photograph skewed back by the same angle, so the cut is diagonal and the picture stays upright. `variant` picks the set: outdoors and people on home, indoors and treats on appointment. Uses direct image tags, not `next/image` — see below |
| `NewYearJazzPlayer`          | bottom-right, all pages      | SVG record and tone arm over a Canvas level meter. Click reveals the embedded lo-fi playlist and starts the disc turning — see the note below on why the embed is visible                                                                                                                                                                      |
| `NewYearRequestLever`        | buttons with `requestAction` | red-mittened hand on a candy-cane lever, pivots on its gate                                                                                                                                                                                                                                                                                    |
| `NewYearProjectOrnament`     | each project card            | bauble that swings on hover only — no idle loop, so a page of cards costs nothing at rest                                                                                                                                                                                                                                                      |
| `NewYearBookingLoadingScene` | the booking wait             | snow globe: SVG dome and plinth, Canvas snow inside, GSAP rock-and-settle                                                                                                                                                                                                                                                                      |
| `NewYearFireworksEvent`      | randomly, over the town      | Canvas particles with gravity and drag, GSAP flash at each shell                                                                                                                                                                                                                                                                               |
| navbar garland               | the repo strip               | a light string sagging across it, bulbs twinkling out of phase, parallax off the scroll position                                                                                                                                                                                                                                               |

`NewYearRequestLever` reuses the plumbing class names the Halloween hand introduced on the
button, and adds `new-year-request-control` / `new-year-request-content` beside them. Both sets
are theme-scoped, so only one is ever live.

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

### Verified in a real browser

Driven with Playwright against the running dev server, not read off screenshots:

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

### Known limit — `text-cta`

`--cta` at `354deg 78% 48%` is `#da1b2e`. Against **any** dark background that colour tops out
at 4.18:1, so it can never reach the 4.5:1 small-text floor on this theme; on the panel wash it
measures 2.8:1. It is correct as a surface — the velvet control, trim, the garland, the progress
fill, with warm snow on top of it at 7.7:1 — but `text-cta` is currently used as small bold text
in around 41 places, and in this palette those read poorly.

Three ways out, and this is a palette decision rather than a code one:

1. Lighten `--cta` toward roughly `354deg 82% 68%`, which clears 4.5:1 on the wash but moves the
   crimson away from the value sampled from `-38` / `-39`.
2. Keep the sampled crimson and add a separate lighter token for crimson **text**, the same split
   `--skill-ramp-*` uses to keep a scale out of a theme's hands.
3. Keep it and accept the reading, on the grounds that those labels are decorative.

Nothing here picks one. Until one is picked, the crimson stays at the sampled value.
