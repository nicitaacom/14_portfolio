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

| Component                    | Renders                      | Notes                                                                                                                                                                   |
| ---------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NewYearScene`               | the backdrop                 | Canvas snow in three parallax depths with two-period wind drift, SVG interior (window on a snowing town, fir boughs, light string, candles), GSAP bauble sway and bokeh |
| `NewYearRequestLever`        | buttons with `requestAction` | red-mittened hand on a candy-cane lever, pivots on its gate                                                                                                             |
| `NewYearProjectOrnament`     | each project card            | bauble that swings on hover only — no idle loop, so a page of cards costs nothing at rest                                                                               |
| `NewYearBookingLoadingScene` | the booking wait             | snow globe: SVG dome and plinth, Canvas snow inside, GSAP rock-and-settle                                                                                               |
| `NewYearFireworksEvent`      | randomly, over the town      | Canvas particles with gravity and drag, GSAP flash at each shell                                                                                                        |
| navbar garland               | the repo strip               | a light string sagging across it, bulbs twinkling out of phase, parallax off the scroll position                                                                        |

`NewYearRequestLever` reuses the plumbing class names the Halloween hand introduced on the
button, and adds `new-year-request-control` / `new-year-request-content` beside them. Both sets
are theme-scoped, so only one is ever live.

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
