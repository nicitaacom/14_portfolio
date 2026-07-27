🔧 How it works — 4 moving parts

1. The ring geometry

An <svg> sits 4px outside the button on every side.

It is sized explicitly — <svg> is a replaced element, so inset alone leaves it at its intrinsic 300x150.

2. The travelling segment

pathLength="100" renormalizes the rect's perimeter to 100 units.

stroke-dasharray: 25 75 then means "a quarter drawn, three quarters gap" at any button size.

3. The lap

Animating stroke-dashoffset from 0 to -100 moves the segment exactly one full lap.

Exactly one lap is why it loops seamlessly — -200 or -150 would jump on repeat.

4. The hand-over

After 2 laps a class flips, and two transitions of the same length run together:

the segment fades to opacity: 0
the dim border animates to white + box-shadow glow
The svg is removed only after the fade, so its animation stops instead of running invisibly.

📄 Markup

<div class="hint">
  <button class="hint__target" type="button">☰</button>
  <span class="hint__ring" aria-hidden="true"></span>
  <svg class="hint__progress" aria-hidden="true">
    <rect x="1" y="1" rx="14" pathLength="100" />
  </svg>
</div>
🎨 CSS
.hint {
  position: relative;
  display: inline-flex;
  --hint-offset: 4px;
  --hint-radius: 14px;
  --hint-fade: 600ms;
  --hint-lap: 1400ms;
}

.hint**ring,
.hint**progress {
position: absolute;
pointer-events: none;
}

.hint\_\_ring {
inset: calc(var(--hint-offset) \* -1);
border: 2px solid rgb(255 255 255 / 0.4);
border-radius: var(--hint-radius);
transition:
border-color var(--hint-fade) ease-out,
box-shadow var(--hint-fade) ease-out;
}

.hint\_\_progress {
top: calc(var(--hint-offset) _ -1);
left: calc(var(--hint-offset) _ -1);
width: calc(100% + var(--hint-offset) _ 2);
height: calc(100% + var(--hint-offset) _ 2);
overflow: visible;
transition: opacity var(--hint-fade) ease-out;
}

.hint\_\_progress rect {
width: calc(100% - 2px);
height: calc(100% - 2px);
fill: none;
stroke: #fff;
stroke-width: 2;
stroke-linecap: round;
stroke-dasharray: 25 75;
animation: hint-lap var(--hint-lap) linear infinite;
}

@keyframes hint-lap {
from { stroke-dashoffset: 0; }
to { stroke-dashoffset: -100; }
}

.hint.is-done .hint\_\_progress {
opacity: 0;
}

.hint.is-done .hint\_\_ring {
border-color: #fff;
box-shadow:
0 0 4px #fff,
0 0 10px rgb(255 255 255 / 0.75),
0 0 16px rgb(255 255 255 / 0.45);
animation: hint-pulse 2s ease-in-out infinite;
}

@keyframes hint-pulse {
0%, 100% { opacity: 1; }
50% { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
.hint**progress rect,
.hint.is-done .hint**ring {
animation: none;
}
}
⏱️ The two timers
const hint = document.querySelector(".hint")
const lapsMs = 2800 // 2 laps of 1400ms
const fadeMs = 600

setTimeout(() => {
hint.classList.add("is-done")
setTimeout(() => hint.querySelector(".hint\_\_progress").remove(), fadeMs)
}, lapsMs)
📌 The three details worth keeping
pathLength="100" — dash values become percentages, so one recipe fits a 40px button and a 300px row.
No viewBox — a stretched viewBox makes the 2px stroke thick on long edges and thin on short ones, and bends the corner radius.
One duration for both transitions — --hint-fade drives the fade-out and the glow-in, so they cannot drift apart.
The live version is in app/components/Navbar/components/HamburgerMenu.tsx — same numbers, Tailwind classes instead of the CSS above, with SMIL <animate> for the lap.
