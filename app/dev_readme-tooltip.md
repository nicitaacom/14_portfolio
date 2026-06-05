## Tooltip usage

### Legacy (still works)

```tsx
<div className="relative tooltip">
  <p className="font-bold">isGMLive</p>
  <p className="tooltiptext">123</p>
</div>
```

### Directional variants (preferred)

Use `tooltip-t`, `tooltip-b`, `tooltip-l`, or `tooltip-r` on the wrapper and the matching `tooltiptext-t/b/l/r` on the tooltip text. No extra `relative` needed.

```tsx
{/* Top — tooltip appears above */}
<div className="tooltip-t">
  <p>Hover me</p>
  <p className="tooltiptext-t">Tooltip content</p>
</div>

{/* Bottom — tooltip appears below */}
<div className="tooltip-b">
  <p>Hover me</p>
  <p className="tooltiptext-b">Tooltip content</p>
</div>

{/* Left — tooltip appears to the left */}
<div className="tooltip-l">
  <p>Hover me</p>
  <p className="tooltiptext-l">Tooltip content</p>
</div>

{/* Right — tooltip appears to the right */}
<div className="tooltip-r">
  <p>Hover me</p>
  <p className="tooltiptext-r">Tooltip content</p>
</div>
```

You can also control width with e.g. `w-[219px]` on the tooltiptext element.

Features: scale + fade animation, arrow pointer, dark background with border and shadow.

## How to delete tooltip from skill

1. In `page.tsx` in this folder delete line props from `<Skill/>` `tooltip` and `tooltiptext`
2. In `components/Tooltips` delete that tooltip and from index.ts as well
