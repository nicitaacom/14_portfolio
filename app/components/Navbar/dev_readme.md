# Navbar

## Structure

```
Navbar (server)
└── NavbarWithProgress (client)
    ├── Portfolio link (shrink-0)
    ├── NavbarProjects (flex-1, min-w-0) — scrollable project list
    └── Right section (shrink-0)
        ├── LanguageDropdown
        └── AdminDropdown (admin users only)
```

## NavbarProjects

- Renders all repos from `@/data/repos` as a horizontally scrollable list
- Uses `useSlider` hook for drag-to-scroll (mouse + touch)
- Outer wrapper: `flex-1 min-w-0` — takes remaining space between Portfolio link and right section, clips overflow
- Scroll container: `w-full overflow-x-scroll hide-scrollbar` — scrollable, no visible scrollbar
- Shadow overlay: absolutely positioned gradient on the right edge fading into `bg-primary-foreground`
- Only visible at `desktop` breakpoint (1440px+)

## useSlider centering

On mount, `useSlider` centers the scroll position to the middle of the list:
```ts
const diff = scrollWidth - clientWidth  // must use element's clientWidth, NOT document.body.clientWidth
wrapperRef.current.scrollLeft = diff / 2
```
**Important:** use `wrapperRef.current.clientWidth` — using `document.body.clientWidth` gives wrong diff because the scroll container is narrower than the full page.

## Progress border

The bottom border of the nav animates from grey to CTA color as the user scrolls through projects.
Tracked via `scrollRef` passed from `NavbarProjects` → `NavbarWithProgress` via `setScrollRef`.

## LanguageDropdown

- Always visible (not gated on userId)
- Switches locale, sets `NEXT_LOCALE` cookie, calls `router.replace` + `router.refresh`
- Dropdown opens downward with `z-[120]`

## AdminDropdown

- Only rendered when `userId` is defined (admin users)
- Contains GM live toggle checkbox and link to `/admin-dashboard`

## Right-edge shadow (fade before LanguageDropdown)

Implemented via `.navbar-right-shadow` in `globals.css`, applied to the right section div in `NavbarWithProgress`.

Uses a `::before` pseudo-element with a gradient background:
```css
.navbar-right-shadow::before {
  width: 80px;
  height: 100%;
  right: 100%;          /* sits just to the left of the right section */
  background: linear-gradient(to left, rgb(48, 48, 48), transparent);
}
```
`rgb(48, 48, 48)` matches `--primary-foreground: hsl(0deg 0% 19%)` = `#303030`.

**Why not box-shadow:** `box-shadow` spreads in all 4 directions. Clipping it to horizontal-only with `clip-path` also clips the shadow itself (clip-path clips everything including box-shadow). A gradient background is the correct approach.

**Why not on NavbarProjects:** `NavbarProjects` is `inline-flex` — it's only as wide as its content, so its right edge is at the last item, not the navbar boundary. The shadow must anchor to the right section div whose `left: 0` is always at the navbar boundary.

**DO NOT:**
- Wrap `NavbarProjects` in an extra div — breaks layout, pushes `LanguageDropdown` off screen
- Use `maskImage` on the scroll div — masks the content, not just the edge
- Use `box-shadow` with `clip-path` — clip-path removes the shadow too
