import { HalloweenScene } from "@/components/Halloween/HalloweenScene"

export function WorkbenchWall() {
  return (
    <div className="seasonal-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="theme-backdrop theme-backdrop-default">
        <div className="default-orbit default-orbit-one" />
        <div className="default-orbit default-orbit-two" />
        <div className="default-grid" />
      </div>

      <svg
        className="theme-backdrop theme-backdrop-crazy-mechanics"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        fill="none">
        <defs>
          <linearGradient id="wall-base" x1="720" y1="0" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0D0A12" />
            <stop offset="1" stopColor="#060409" />
          </linearGradient>
          <pattern id="wall-bricks" width="180" height="92" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="88" height="44" fill="white" fillOpacity="0.015" />
            <rect x="91" y="1" width="88" height="44" fill="hsl(var(--cta))" fillOpacity="0.05" />
            <rect x="1" y="47" width="43" height="44" fill="hsl(var(--cta))" fillOpacity="0.03" />
            <rect x="46" y="47" width="88" height="44" fill="white" fillOpacity="0.025" />
            <rect x="137" y="47" width="43" height="44" fill="black" fillOpacity="0.07" />
            <path
              d="M0 0H180M0 46H180M0 92H180M90 0V46M45 46V92M135 46V92"
              stroke="black"
              strokeOpacity="0.35"
              strokeWidth="2"
            />
            <path
              d="M0 2H180M0 48H180M90 2V46M45 48V92M135 48V92"
              stroke="white"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          </pattern>
          <filter id="wall-grain" x="0" y="0" width="1440" height="900" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <linearGradient id="wall-pool-fade" x1="720" y1="0" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.3" />
            <stop offset="0.8" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="wall-light-zone" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="900">
            <rect width="1440" height="900" fill="black" />
            <path d="M720 -80L60 900H1380L720 -80Z" fill="url(#wall-pool-fade)" />
          </mask>
          <radialGradient id="wall-pool" cx="0" cy="0" r="1" gradientTransform="translate(720 0) scale(820 620)">
            <stop stopColor="hsl(var(--cta))" stopOpacity="0.13" />
            <stop offset="0.55" stopColor="hsl(var(--cta))" stopOpacity="0.05" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wall-vignette" cx="0" cy="0" r="1" gradientTransform="translate(720 380) scale(980 720)">
            <stop stopColor="black" stopOpacity="0" />
            <stop offset="0.72" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#wall-base)" />
        <rect width="1440" height="900" fill="url(#wall-bricks)" mask="url(#wall-light-zone)" />
        <rect width="1440" height="900" fill="white" filter="url(#wall-grain)" mask="url(#wall-light-zone)" />
        <rect width="1440" height="900" fill="url(#wall-pool)" className="workbench-glow" />
        <rect width="1440" height="900" fill="url(#wall-vignette)" />
      </svg>

      <div className="theme-backdrop theme-backdrop-halloween">
        <HalloweenScene />
      </div>

      <div className="theme-backdrop theme-backdrop-new-year">
        <div className="new-year-aurora new-year-aurora-one" />
        <div className="new-year-aurora new-year-aurora-two" />
        <div className="new-year-snow new-year-snow-back" />
        <div className="new-year-snow new-year-snow-front" />
        <svg className="new-year-star new-year-star-left" viewBox="0 0 120 120" fill="none">
          <path d="M60 8V112M8 60H112M23 23L97 97M97 23L23 97" />
          <circle cx="60" cy="60" r="19" />
        </svg>
        <svg className="new-year-star new-year-star-right" viewBox="0 0 120 120" fill="none">
          <path d="M60 8V112M8 60H112M23 23L97 97M97 23L23 97" />
          <circle cx="60" cy="60" r="19" />
        </svg>
        <div className="new-year-frost" />
      </div>
    </div>
  )
}
