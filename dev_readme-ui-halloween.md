## Halloween UI description

The Halloween theme is a complete haunted-game interface inspired by the references in
[`public/UI/halloween`](public/UI/halloween). It is not a brown or orange version of Crazy Mechanics.

## 0. Why this document exists

The first seasonal pass changed material tokens while retaining the workshop's rectangles, rivets, pipe frames, paper tabs,
and machine hierarchy. That still reads as Crazy Mechanics.

Halloween needs its own visual grammar. A visitor should recognize the season from a silhouette with all text hidden:
crooked thorn frames, carved stone controls, candle pools, pumpkins, skulls, webs, graves, and deep purple-black negative
space.

The reference images are design specimens. They are not shipped as CSS backgrounds or stretched UI skins. Every production
surface is recreated with CSS, SVG, or Canvas so it remains responsive, sharp, themeable, and accessible.

---

## 1. Reference map

| Reference                                                | Strongest idea                                                                                | Portfolio use                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`halloween-1.png`](public/UI/halloween/halloween-1.png) | A complete menu framed by vines, roses, candles, skull, webs, and pumpkin clusters            | Page framing, navbar ornaments, primary menu composition |
| [`halloween-2.png`](public/UI/halloween/halloween-2.png) | Thick irregular haunted frame, layered black inset, playful purple controls                   | Forms, dropdowns, settings, auth and admin panels        |
| [`halloween-3.png`](public/UI/halloween/halloween-3.png) | Compact control vocabulary: orange buttons, purple slabs, potion meters, round icon controls  | Buttons, inputs, toggles, progress bars, calendar states |
| [`halloween-4.png`](public/UI/halloween/halloween-4.png) | Purple skull-and-web dialog with bright icon choices                                          | Project and appointment modals                           |
| [`halloween-5.jpg`](public/UI/halloween/halloween-5.jpg) | Shape atlas: thorns, skulls, skeletons, graves, coffin, pumpkins, web corners, frame segments | Reusable SVG paths and silhouette rules                  |
| [`graves.jpg`](public/UI/halloween/graves.jpg)           | Crooked cartoon gravestones with layered stone, cracks, moss, skulls, and irregular bases     | Random thunder-event gravestone                          |

### Reference-use rule

Copy proportions, layering, material contrast, and ornament placement. Do not trace watermarks, copy raster fragments into
production, or place the reference images behind content.

---

## 2. Hard separation from Crazy Mechanics

The following parts are forbidden while `data-theme="halloween"` is active:

- steel sheets, brass rivets, screws, pipes, bezels, machine slots, gears, hazard stripes, blueprint grids;
- workshop brick and plaster textures;
- paper tape labels and industrial engraved plates;
- metal lever or transmission-gate actions;
- box geometry whose only Halloween change is orange or purple colour.

Allowed Halloween replacements:

| Workshop part    | Halloween replacement                                     |
| ---------------- | --------------------------------------------------------- |
| Workbench wall   | Moonlit graveyard and fog                                 |
| Steel panel      | Crooked crypt slab or haunted purple frame                |
| Pipe frame       | Thorn, bone, or carved-stone frame                        |
| Plaque button    | Raised spell slab or pumpkin-orange capsule               |
| Tape label       | Ragged spectral label or small bone banner                |
| Hazard rail      | Twisting vine with thorns, roses, or tiny pumpkins        |
| Gearset loader   | Summoning ring with orbiting ghost, skull, and pumpkin    |
| Lever submit     | Glowing ritual seal with an SVG skeleton-hand lever       |
| Machine progress | Potion or ectoplasm meter                                 |
| Rivet            | Thorn knot, web anchor, tiny skull, or no corner ornament |

---

## 3. Visual language

### 3.1 Palette

Halloween changes the complete palette, including the interaction accent.

| Token role       | Direction                      |
| ---------------- | ------------------------------ |
| Room             | Almost-black aubergine         |
| Raised surface   | Muted haunted violet           |
| Deep inset       | Blue-black / purple-black      |
| Primary accent   | Jack-o'-lantern orange         |
| Secondary accent | Cemetery green                 |
| Spectral accent  | Cyan-violet ghost light        |
| Body text        | Desaturated bone               |
| Muted text       | Grey-lilac                     |
| Frame edge       | Cold grey bone or thorn purple |
| Error            | Blood red, used sparingly      |

Orange means action. Green means healthy/live. Purple carries the frame. Bone is structure and text. No warm brown workshop
material is used.

### 3.2 Shape

- Frames are irregular and slightly asymmetrical.
- Corners are clipped, pointed, winged, webbed, or interrupted by ornaments.
- A large surface uses one crown ornament and at most two corner ornaments.
- Controls have a raised centre with a dark inset shadow and a pale upper rim.
- Content areas remain flat and dark for readability; ornament lives on the perimeter.
- Rounded rectangles without silhouette treatment are not a finished Halloween surface.

### 3.3 Depth

Halloween keeps depth but changes its vocabulary:

```text
GRAVEYARD
  └── THORN / STONE FRAME
        └── PURPLE INNER RIM
              └── DARK CRYPT CONTENT
                    └── OPTIONAL BONE OR WEB ORNAMENT
```

Three visual levels are normally enough. A fourth is reserved for a modal or project preview. Mobile removes ornaments
before shrinking readable content.

### 3.4 Lighting

- The moon supplies cool ambient light from the upper right.
- Candles and pumpkins supply small warm pools near controls.
- Ghost light may glow from an inset but never lights every edge.
- Shadows fall down and slightly left, opposite the moon.
- Orange glow belongs to actions and pumpkins, not paragraph containers.

### 3.5 Typography

- Inter remains the body and form font.
- Special Elite is allowed for short haunted labels, counters, and one-line headings.
- No body paragraph uses decorative type.
- Visible seasonal text must come from i18n; ornaments do not spell English words.
- The skeleton-hand transmission lever appears only on controls that submit, mutate, or refetch remote data.
- The hand rests at a negative angle and moves to a positive engaged angle when its request control is clicked; it stays engaged while an exposed pending state is true.
- Links, local navigation, modal close/back controls, tabs, filters, and purely local buttons never receive the lever.

---

## 4. Surface vocabulary

| Name                | Meaning                                                |
| ------------------- | ------------------------------------------------------ |
| **Graveyard**       | Full-page environment: moon, fog, graves, fence, trees |
| **Crypt**           | Primary content panel with heavy dark inset            |
| **Thorn frame**     | Flexible outer frame with pointed vine silhouette      |
| **Spell slab**      | Primary or secondary button                            |
| **Bone banner**     | Short label or tooltip title                           |
| **Potion meter**    | Progress, skill value, or status                       |
| **Coffin field**    | Text input, select, or calendar cell inset             |
| **Skull crown**     | One focal ornament on modal or major card              |
| **Web corner**      | Lightweight corner decoration                          |
| **Pumpkin lamp**    | Warm action/status light                               |
| **Summoning ring**  | Loading and request-in-progress state                  |
| **Spectral notice** | Toast, inline result, or confirmation                  |
| **Gravestone card** | Project card or dashboard summary                      |

---

## 5. Component map

```text
Navbar                         → THORN FRAME + SMALL PUMPKIN LIGHTS
Button                         → SPELL SLAB
Input / selects / calendar     → COFFIN FIELD
Skill                          → BONE BANNER + POTION METER
Tooltips                       → WEB CORNER NOTICE
Project card                   → GRAVESTONE CARD
Project modal                  → SKULL-CROWNED CRYPT
Appointment page               → RITUAL BOARD IN THE GRAVEYARD
Appointment modal              → COFFIN / CRYPT DIALOG
Booking loading                → SUMMONING RING
Booking confirmation           → SPECTRAL NOTICE + STEADY CANDLES
Auth                           → HAUNTED SETTINGS PANEL
Admin                          → CRYPT LEDGER + POTION METERS
Toast                          → SPECTRAL NOTICE
Global background              → GRAVEYARD
```

Functional component trees stay shared. Theme-specific ornament slots may be present in the DOM, but CSS hides them outside
Halloween. No component reads a calendar month.

---

## 6. Motion ownership

Each tool has one lane.

### Canvas

One page-wide ambient Canvas draws:

- layered fog with low alpha;
- sparse fireflies / spectral motes;
- occasional distant ghost arcs;
- depth-separated drift.
- depth-separated diagonal rain during the thunder event.

Canvas is decorative, DPR-capped, resized with `ResizeObserver`, and stopped while hidden, reduced-motion, or not Halloween.

### SVG

SVG draws every crisp structural asset:

- thorn frames and vines;
- graveyard silhouettes and crooked trees;
- webs, bones, skulls, pumpkins, coffin, tombstones;
- summoning ring and modal crown;
- potion-meter rims.

Paths use `currentColor` or theme tokens rather than fixed reference colours.

### Framer Motion

Framer handles state owned by React:

- modal and dropdown entrance/exit;
- accordion changes;
- appointment step transitions;
- hover/tap response;
- booking confirmation reveal;
- reduced-motion state variants.

### GSAP

GSAP handles coordinated decorative timelines:

- candle-flame and pumpkin-light irregular flicker;
- bats crossing at different depths;
- thorn/vine settle on major panel entrance;
- booking summoning sequence;
- skull-eye glow and ritual-ring completion.
- paired lightning strikes, gravestone aura, and storm-audio fades.

Every GSAP context is scoped and killed during cleanup.

### Random thunder and grave event

- The first event is scheduled randomly 18–30 seconds after Halloween mounts.
- Later events wait a random 75–130 seconds after the previous cycle.
- A storm darkens the viewport, starts Canvas rain, and reveals an original layered SVG gravestone for a random 4–6 seconds.
- `/thunderstorm.mp3` plays at the main storm level and `/creepy-halloween-bells.mp3` supplies a quieter undertone.
- Audible playback is attempted only through the browser media API and may wait for the visitor's first interaction under autoplay policy.
- After 4–6 seconds, the grave, rain, and lightning fade away and both local tracks fade and stop.
- An open modal or hidden tab cancels the active event and defers the next attempt.
- Reduced-motion disables the automated storm, lightning, grave reveal, and audio together.
- Lightning uses two separated strike groups rather than rapid strobing.

### Motion limits

- Ambient loops run between 8 and 24 seconds and do not share the same period.
- User-triggered response is 80–450ms.
- `body.modal-open` pauses room motion.
- `prefers-reduced-motion` keeps the final readable frame and removes travel/flicker.
- Hidden tabs stop Canvas and GSAP work.

---

## 7. Responsive rules

- Desktop may show moon, both trees, graveyard ridge, and two web corners.
- Tablet removes the secondary tree and reduces fog density.
- Mobile keeps one corner web, one pumpkin cluster, and the graveyard silhouette.
- Skulls never overlap text or interactive targets.
- Decorative frames use `pointer-events: none`.
- Controls retain a minimum 44px touch target even when their visible slab is smaller.
- Modals must still fit 320px-wide screens without horizontal scrolling.

---

## 8. Accessibility and performance

- Decorations are `aria-hidden`.
- Canvas has no semantic content.
- Every action remains a native button/link/input.
- Focus state uses a solid orange-plus-bone outline and is not glow-only.
- Body copy meets WCAG AA against the crypt content surface.
- Essential state is never communicated only by pumpkin/ghost colour.
- Only one page-wide ambient Canvas exists; the booking Canvas replaces it while the paused room sits behind the modal.
- SVG filters are limited to small ornaments; full-screen blur uses CSS/Canvas.
- Off-screen animation is stopped.

---

## 9. Acceptance checklist

The Halloween theme is complete only when:

1. A greyscale screenshot still cannot be mistaken for Crazy Mechanics.
2. No pipes, rivets, screws, gears, hazard stripes, workshop bricks, paper tape, or lever UI remains visible.
3. Navbar, home, skills, projects, project modal, appointment, all booking states, auth, admin, dropdowns, tooltips, and toasts
   use the Halloween vocabulary.
4. The graveyard remains visible without reducing text contrast.
5. All reference-inspired ornaments are code-native.
6. Desktop and mobile screenshots are compared beside the matching `public/UI/halloween` reference.
7. Browser console has no hydration, Canvas, or animation cleanup errors.
8. Reduced-motion and modal-open states are verified.
9. Resolver tests, `npx tsc --noEmit`, `pnpm lint`, and `git diff --check` pass.
10. The random storm keeps `body.scrollWidth === body.clientWidth`, both local MP3s return `200 audio/mpeg`, and no external
    iframe is mounted.
