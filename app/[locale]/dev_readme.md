# Docs roadmap for (site) - how something work

From UI/UX - No docs about how something work because it intitiv understandable
From how it work in .tsx or .ts file - Docs provided with necessary comments in code

# Docs roadmap for (site) - how to implement something

## How to change numbers

ctrl+p - `hours.ts`

## Tooltip usage

tooltiptext should be relative to something - so make sure that you added `relative tooltip` for parent
You may add `relative` for parent of tooltip

```tsx
<div className="relative tooltip">
  <p className="font-bold">isGMLive</p>
  <p className="tooltiptext">123</p>
</div>
```

## How to delete tooltip from skill

1. In `page.tsx` in this folder delete line props from `<Skill/>` `tooltip` and `tooltiptext`
2. In `components/Tooltips` delete that tooltip and from index.ts as well

## How to add some project

Check `components/Projects/dev_readme.md`
