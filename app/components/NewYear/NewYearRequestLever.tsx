"use client"

import { useId } from "react"

import { motion, useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

interface NewYearRequestLeverProps {
  compact?: boolean
  engaged: boolean
}

/* The gate boss the lever turns on, in viewBox units. The rotating group states this same
   pair as its transform origin, so the two stay in step */
const LEVER_PIVOT_X = 36
const LEVER_PIVOT_Y = 65

export function NewYearRequestLever({ compact = false, engaged }: NewYearRequestLeverProps) {
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()
  const instanceId = useId().replaceAll(":", "")
  const shadowId = `new-year-lever-shadow-${instanceId}`
  const mittenId = `new-year-lever-mitten-${instanceId}`

  if (theme !== "new-year") return null

  return (
    <span
      className={`new-year-transmission-lever ${compact ? "new-year-transmission-lever-compact" : ""}`}
      aria-hidden="true">
      <svg className="h-full w-full overflow-visible" viewBox="0 0 72 82" fill="none">
        <defs>
          <filter id={shadowId} x="-50%" y="-40%" width="200%" height="210%">
            <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#020a07" floodOpacity="0.7" />
          </filter>
          <radialGradient id={mittenId} cx="0" cy="0" r="1" gradientTransform="translate(31 19) scale(24)">
            <stop stopColor="#f4566a" />
            <stop offset="0.44" stopColor="#c81a30" />
            <stop offset="1" stopColor="#79101d" />
          </radialGradient>
        </defs>

        {/* The gate: a frosted plate with snow on its lip and a crimson-ringed boss */}
        <rect
          className="new-year-lever-gate"
          x="12"
          y="54"
          width="48"
          height="25"
          rx="9"
          fill="#072016"
          stroke="#d9c397"
          strokeOpacity="0.58"
          strokeWidth="2.5"
        />
        <path
          d="M16 56.5C22 53.5 28 53.5 34 56.5C40 53.5 46 53.5 56 56.5"
          stroke="#fffdfa"
          strokeOpacity="0.5"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={LEVER_PIVOT_X} cy={LEVER_PIVOT_Y} r="9" fill="#04150f" stroke="#c81a30" strokeWidth="3" />
        <circle cx={LEVER_PIVOT_X} cy={LEVER_PIVOT_Y} r="3" fill="#d9c397" />

        {/* The lever. transformBox is stated explicitly because motion-dom forces
            transform-box: fill-box on SVG children, which would resolve originX/originY
            against this group's own bbox corner and make it orbit instead of pivot */}
        <motion.g
          filter={`url(#${shadowId})`}
          initial={false}
          animate={{
            rotate: engaged ? 30 : -26,
            x: engaged ? 3 : 0,
            y: engaged ? 2 : 0,
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 330,
                  damping: 18,
                  mass: 0.65,
                }
          }
          style={{ transformBox: "view-box", originX: `${LEVER_PIVOT_X}px`, originY: `${LEVER_PIVOT_Y}px` }}>
          {/* Candy-cane shaft: a snow-white bar with crimson bands dashed over it */}
          <path d="M36 62V31" stroke="#fdfbf6" strokeWidth="8" strokeLinecap="round" />
          <path d="M36 60V32" stroke="#c81a30" strokeWidth="8" strokeDasharray="4.5 5.5" />

          {/* Red mitten gripping the shaft, fur cuff at the wrist */}
          <path
            d="M27 28C22.6 26.4 21 22.6 23.4 19.9C25.2 17.8 28.4 18.5 29.4 21.2Z"
            fill={`url(#${mittenId})`}
            stroke="#79101d"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <path
            d="M28.5 35C25 28 25.5 20.8 29 17.4C32.5 14 40 14 43.5 17.4C47 20.8 47.5 28 44 35Z"
            fill={`url(#${mittenId})`}
            stroke="#79101d"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <path
            d="M30.5 23.5C34.5 21.9 38.5 21.9 42.5 23.5M30.5 28C34.5 26.4 38.5 26.4 42.5 28"
            stroke="#fff2f2"
            strokeOpacity="0.28"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <rect x="26.4" y="33.4" width="19.2" height="7.8" rx="3.9" fill="#fffdfa" />
          <path
            d="M29 35.5C31 38.5 34 39.6 36 37.4C38 39.6 41 38.5 43 35.5"
            stroke="#e6e0d4"
            strokeOpacity="0.7"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </span>
  )
}
