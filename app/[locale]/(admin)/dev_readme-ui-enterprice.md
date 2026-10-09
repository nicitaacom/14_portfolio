# Enterprice UI

## Terminology

- **Enterprice UI** — this screen's own mood brief: SAP-grade, dark, serious, box-in-box paddings —
  a style description, not a component name.
- **vibes list** — the "Enterprice UI vibes" bullets below; each is one felt reference point, not a
  literal spec.

**Enterprice UI description:**

- I want to keep it in solid style like 100000 people use this
- I want it to look like something closed
- UI should be similar to SAP or to support (second image)
- So it looks like it's a lot of code under the hood (looks serious and very well tested and something slow - yes yes something slow)
- User should feel that this is serious and very well tested and used by millions
- it must look like something really massive is runned under the hood
- It also should be a little-bit modern, darker look
- look like a serious, enterprise-grade tool similar to SAP systems
- BOLD TEXT
- confitent look
- paddings in paddings (box in box UI)
- look like a serious, enterprise-grade tool similar to SAP systems

**Intentional slowness:**

Slowness is part of this UI's vibe. Loading and section changes should retain the deliberate,
heavy feel of an enterprise SAP system with a massive amount of work happening under the hood.
Keep the native SVG metal-dot relief and the mechanical brightness transitions rather than
optimizing away that character or making every interaction feel instant.

Scrolling is the exception: it should stay smooth, targeting 60 fps. Keep scrolling contained
to its own panels and clear whole-panel brightness filters when a transition finishes, so the
slower enterprise feel does not make scrolling stutter. Continue to respect reduced-motion preferences.

The console background should read as one continuous metallic wall. Its native SVG studs use
lighting waves across the whole surface, without restarting a vignette in repeated square tiles.
Keep Availability compact: one page heading, grouped date and timezone controls, an inline range
selector, and a slot grid that uses the available width so a full day fits on a normal desktop screen.

**Enterprice UI vibes:**

- it's kinda next.js SSG vibes
- it's jumping loading vibes
- It's 10000000 users vibe
- it's not tall but strong wide man vibe
- it's play default not invent vibe
- it's 808 bass vibe
- It's big numbers vibe
- it's electric station or conditioner or vents or plane sounds vibe
- it's aggressive look like this vibe
- it's business vibe where nothing like "ah we have nice team coffee and cookies and we will take care of you and provide you a good service" - it's more like "here is your service pay here - everything is automated no real human involved"
- it's more night vibes
- it's more rich vibes without cheap 10$ plastic but something 100$ metall or stale
- it's something collaboration vibes where 20k+ commits on github and people know each other and they are the best
- everything feels like tested lots of times with edge cases and work 100% times (no way to break it)
- feels like something with security like I paid for it or feeling like this is for specific limited group of people
- paddings in paddings (box in box UI)
- it feels like some physical server somewhre hunderds miles away undeground in winter processing hunderds of requests per second

**♫ Music that would help to understand vibe:**

guys that are experts (10k+ hours) in what they do came like that and then went back home https://youtu.be/EHQnXOnZ3rU?t=142

![handshake](https://i.imgur.com/v0ROsyg.jpeg)

not tall but wide and stong man vibe https://www.youtube.com/watch?v=2aSHYRN3AVU
![Enterprice UI vibes 1](/public/UI/enterprice-ui-vibes-1.png)

https://www.youtube.com/watch?v=a4E95rYAe4U&ab_channel=dhePerissann<br/>
e.g support chat - user send msg (req) -> support replies as resp back from server
![Enterprice UI vibes 2](/public/UI/enterprice-ui-vibes-2.jpg)

**🖼️ Images that would help to understand vibe:**

Included above

# LambdaSetupScreen UI Patterns

Same enterprise terminal aesthetic as the DNC page.

## How this screen extends those patterns

### Color palette

Stricter dark palette than DNC — explicit hex values, not theme tokens:

- `bg-[#0d0d0d]` — main screen background
- `bg-[#0a0a0a]` — sidebar / tab background
- `bg-[#080808]` — bottom bar and section header rows
- `bg-[#161616]` — active tab
- `#02c9b3` — accent/brand color (active tab indicator, CTA button, success text)
- `border-gray-700` / `border-gray-800` — all internal dividers

### Tabs

Hard-edge tab strip, `border-r border-gray-800` between tabs:

```
activeTab   → bg-[#161616] text-white border-t-2 border-t-[#02c9b3]
inactiveTab → bg-[#0a0a0a] text-gray-600 hover:text-gray-300
```

`font-mono uppercase tracking-wide text-[9px] tablet:text-[10px]`
No pill shape, no radius.

### Data table (env vars)

`<table className="w-full border-collapse">` — same DNC pattern.
Section header row: `bg-[#080808] text-[10px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-800`
Field rows alternate between StaticField / AutoFillField / UserField components —
all share the same table-cell structure, no card wrapping.

### Bottom action bar

`flex items-start justify-between px-3 py-2 border-t border-gray-800 bg-[#080808]`
CTA button style:

```
enabled  → border-[#02c9b3] text-[#02c9b3] hover:bg-[#02c9b3]/10
disabled → border-gray-800 text-gray-700 cursor-not-allowed
```

`font-mono uppercase tracking-wide text-[9px] tablet:text-xs` — no radius, no fill on enabled state.

### Terminal sidebar

Fixed `w-[360px]` on desktop, collapsible to `w-[32px]` on laptop via framer-motion width animation.
Mobile: slides up from bottom as a `50vh` overlay, `fixed bottom-0`.
Always `border-l border-gray-700/800`, `bg-[#0a0a0a]`.

### Success screen

`border border-gray-700 bg-[#0a0a0a] p-6 text-left font-mono`
Header: `text-xs uppercase tracking-widest text-[#02c9b3]` — no icon.
Body: dense legal/compliance copy in `text-[11px] text-gray-400`.
Footer: `text-[10px] uppercase tracking-widest text-gray-600` with countdown.
Fades in via `motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}`.
