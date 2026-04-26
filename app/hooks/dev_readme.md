## Usage for useSlider.ts

### This hook is required to scroll with mouse in navbar

[![useSlider-image](https://i.imgur.com/1dLWPt0.png)](https://youtu.be/aiCgKO3_xc0)

### You may use it like

```tsx
  const { handleMouseDown, handleMouseMove, handleTouchDown, handleTouchMove } = useSlider()

   <div
        className="hidden desktop:inline-flex overflow-x-hidden w-[90%]"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}>
        <ul className="hidden desktop:inline-flex items-center gap-md">
          {repos.map(repo => (
            <li key={repo.id} className="flex flex-col items-center w-[10rem] select-none">
          )}
```
