"use client"

import { FiCheckCircle, FiShield } from "react-icons/fi"
import { useScopedI18n } from "@/locales/client"

export function NDAProjectPreview() {
  const t = useScopedI18n("ndaProject.preview")

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#09070d]">
      <div
        className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_50%_28%,hsl(var(--cta)/0.09),transparent_34%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-secondary-foreground/20 to-transparent"
        aria-hidden="true"
      />

      <svg
        className="absolute inset-x-0 top-0 h-[430px] w-full"
        viewBox="0 0 600 430"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={t("ariaLabel")}>
        <defs>
          <linearGradient id="nda-cable" x1="300" y1="6" x2="300" y2="156" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="nda-metal" x1="224" y1="122" x2="371" y2="226" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38323F" />
            <stop offset="0.48" stopColor="#17131D" />
            <stop offset="1" stopColor="#08070A" />
          </linearGradient>
          <linearGradient id="nda-rim" x1="217" y1="137" x2="380" y2="214" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--secondary))" stopOpacity="0.42" />
            <stop offset="0.45" stopColor="hsl(var(--cta))" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="nda-beam" x1="300" y1="198" x2="300" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--cta))" stopOpacity="0.28" />
            <stop offset="0.52" stopColor="hsl(var(--cta))" stopOpacity="0.08" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0" />
          </linearGradient>
          {/* How far down the beam the wall stays lit — full under the bulb, gone by the floor */}
          <linearGradient id="nda-brick-mask" x1="300" y1="197" x2="300" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="1" />
            <stop offset="0.55" stopColor="white" stopOpacity="0.52" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          {/* Running bond. Every brick gets a face so the wall reads as masonry, and the
              courses get a lit top edge — the lamp mask below decides how much of it shows */}
          <pattern id="nda-lit-bricks" width="180" height="92" patternUnits="userSpaceOnUse">
            <rect width="180" height="92" fill="hsl(var(--cta))" fillOpacity="0.06" />

            <rect x="2" y="2" width="86" height="42" fill="hsl(var(--cta))" fillOpacity="0.13" />
            <rect x="92" y="2" width="86" height="42" fill="hsl(var(--cta))" fillOpacity="0.19" />
            <rect x="2" y="48" width="41" height="42" fill="hsl(var(--cta))" fillOpacity="0.16" />
            <rect x="47" y="48" width="86" height="42" fill="hsl(var(--cta))" fillOpacity="0.11" />
            <rect x="137" y="48" width="41" height="42" fill="hsl(var(--cta))" fillOpacity="0.18" />

            <path
              d="M0 0H180M0 46H180M0 92H180M90 0V46M45 46V92M135 46V92"
              stroke="white"
              strokeOpacity="0.24"
              strokeWidth="1.5"
            />
            <path d="M2 3H88M92 3H178M2 49H43M47 49H133M137 49H178" stroke="white" strokeOpacity="0.14" />
          </pattern>
          <mask id="nda-moving-light-zone" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="430">
            <rect width="600" height="430" fill="black" />
            <g className="nda-lamp-swing">
              <path d="M300 197L132 430H468L300 197Z" fill="url(#nda-brick-mask)" />
            </g>
          </mask>
          <radialGradient id="nda-bulb" cx="0" cy="0" r="1" gradientTransform="translate(300 205) rotate(90) scale(60)">
            <stop stopColor="white" />
            <stop offset="0.28" stopColor="hsl(var(--secondary))" />
            <stop offset="0.62" stopColor="hsl(var(--cta))" stopOpacity="0.9" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0" />
          </radialGradient>
          <filter id="nda-purple-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="nda-soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#000" floodOpacity="0.75" />
          </filter>
          <filter id="nda-panel-segment-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="nda-panel-interior">
            <rect x="205" y="126" width="190" height="82" rx="4" />
          </clipPath>
        </defs>

        <circle cx="300" cy="10" r="8" fill="#100D14" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
        <circle cx="300" cy="10" r="3" fill="hsl(var(--cta))" />

        <rect
          width="600"
          height="430"
          fill="url(#nda-lit-bricks)"
          mask="url(#nda-moving-light-zone)"
          className="nda-lamp-beam"
        />

        <g className="nda-lamp-swing">
          <path d="M300 13V132" stroke="url(#nda-cable)" strokeWidth="3" />
          <path d="M300 197L132 430H468L300 197Z" fill="url(#nda-beam)" className="nda-lamp-beam" />
          <ellipse
            cx="300"
            cy="207"
            rx="74"
            ry="64"
            fill="hsl(var(--cta))"
            fillOpacity="0.2"
            filter="url(#nda-purple-glow)"
            className="nda-lamp-glow"
          />

          <g filter="url(#nda-soft-shadow)">
            <rect x="283" y="112" width="34" height="26" rx="5" fill="#17131D" stroke="white" strokeOpacity="0.22" />
            <rect
              x="205"
              y="126"
              width="190"
              height="82"
              rx="4"
              fill="url(#nda-metal)"
              stroke="url(#nda-rim)"
              strokeOpacity="0.28"
              strokeWidth="3"
            />
            <rect
              x="209"
              y="130"
              width="182"
              height="74"
              rx="2"
              pathLength="100"
              className="nda-lamp-panel-progress"
              filter="url(#nda-panel-segment-glow)"
              clipPath="url(#nda-panel-interior)"
            />
            <path d="M206 207H394" stroke="hsl(var(--cta))" strokeOpacity="0.22" strokeWidth="3" />
            <svg
              x="280"
              y="151.5"
              width="60"
              height="31.08"
              viewBox="0 0 554 287"
              preserveAspectRatio="xMidYMid meet"
              className="nda-lamp-email-icon"
              fill="none"
              stroke="white"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
              focusable="false"
              aria-hidden="true">
              <path d="M23 73H112M53 116H134M23 160H112" />
              <path d="M89 51V35C89 22 98 15 112 15H376C390 15 399 24 397 38L387 204C386 216 378 222 366 222H91C78 222 72 211 75 199L82 158" />
              <path d="M103 30L242 149C249 155 255 155 262 149L392 31" />
              <path d="M80 207L203 94M373 207L289 95" />
              <path d="M305 176H442L431 165C427 161 427 157 431 153L437 147C441 143 445 143 449 147L494 177C500 181 500 187 494 191L449 221C445 225 441 225 437 221L431 215C427 211 427 207 431 203L442 193H305" />
              <path d="M296 176H366M310 185H383M324 194H429" />
            </svg>
          </g>

          <ellipse
            cx="300"
            cy="210"
            rx="49"
            ry="42"
            fill="url(#nda-bulb)"
            fillOpacity="0.86"
            className="nda-lamp-glow"
          />
          <path
            d="M274 197C274 181.8 284.7 172 301.4 172C317.6 172 327 180.7 327 193.2C327 203.2 322 209.1 312.6 214.9C305 219.6 302.2 223.4 302.2 230.5V234H287V228.3C287 216.6 292.8 210.3 302.8 204.2C309.4 200.1 312 197.4 312 193.5C312 188.7 307.8 185.7 301 185.7C293.2 185.7 288.3 189.5 287.6 197.4L274 197ZM286.2 244.5H302.7V260.5H286.2V244.5Z"
            fill="#F4F0F8"
            className="nda-lamp-glow"
            transform="translate(0 34)"
          />
        </g>
      </svg>

      <div
        className="pointer-events-none absolute z-30 bg-gradient-to-t from-[#09070d] via-[#09070d]/95 to-transparent px-lg pb-lg pt-[90px] text-center"
        style={{ right: 0, bottom: 0, left: 0 }}>
        <div className="mx-auto max-w-[720px]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cta">{t("level")}</p>
          <h2 className="mt-sm text-lg font-bold tracking-tight text-secondary">{t("title")}</h2>
          <p className="mx-auto mt-sm max-w-[500px] text-sm leading-relaxed text-secondary-foreground/60">
            {t("description")}
          </p>
          <div className="mt-md flex items-center justify-center gap-x-lg text-[11px] font-medium uppercase tracking-[0.08em] text-secondary-foreground/30">
            <span className="inline-flex items-center gap-x-[6px]">
              <FiShield className="h-3 w-3 text-cta/40" aria-hidden="true" />
              {t("identityProtected")}
            </span>
            <span className="inline-flex items-center gap-x-[6px]">
              <FiCheckCircle className="h-3 w-3 text-cta/40" aria-hidden="true" />
              {t("outcomes", { count: 43 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
