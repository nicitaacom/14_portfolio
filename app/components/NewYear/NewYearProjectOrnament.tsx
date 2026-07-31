"use client"

import { useId } from "react"

import { motion, useAnimationControls, useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

/* The knot at the top of the thread, in viewBox units. The rotating group states the same
   pair as its origin so the bauble swings from the knot */
const ORNAMENT_PIVOT_X = 27
const ORNAMENT_PIVOT_Y = 4

/* A damped pendulum: each swing overshoots less than the one before it */
const SWING_KEYFRAMES = [0, 9, -7, 5, -3, 1.6, 0]

export function NewYearProjectOrnament() {
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()
  const swingControls = useAnimationControls()
  const instanceId = useId().replaceAll(":", "")
  const glassId = `new-year-ornament-glass-${instanceId}`
  /* The side the pointer came in on decides which way it swings first. The bauble hangs below
     the knot it turns around, so a positive angle sends it left — entering from the right
     therefore flips the whole set of angles to send it right instead. Same rule as the
     window-head baubles in NewYearScene, so both read the same way under the pointer */
  const triggerSwing = (event: React.MouseEvent<SVGCircleElement>) => {
    if (reduceMotion) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const swingDirection = event.clientX > bounds.left + bounds.width / 2 ? -1 : 1

    swingControls.stop()
    swingControls.set({ rotate: 0 })
    void swingControls.start({
      rotate: SWING_KEYFRAMES.map(angle => angle * swingDirection),
      transition: { duration: 2.3, ease: "easeOut" },
    })
  }

  if (theme !== "new-year") return null

  return (
    <span className="new-year-project-ornament" aria-hidden="true">
      <svg className="h-full w-full overflow-visible" viewBox="0 0 54 96" fill="none">
        <defs>
          <radialGradient id={glassId} cx="0" cy="0" r="1" gradientTransform="translate(19 57) scale(30)">
            <stop stopColor="#f4566a" />
            <stop offset="0.4" stopColor="#c81a30" />
            <stop offset="1" stopColor="#79101d" />
          </radialGradient>
        </defs>

        {/* transformBox is stated explicitly: motion-dom forces transform-box: fill-box on SVG
            children, which would resolve the origin against this group's own bbox corner and
            swing the bauble around a point outside itself */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={swingControls}
          style={{
            transformBox: "view-box",
            originX: `${ORNAMENT_PIVOT_X}px`,
            originY: `${ORNAMENT_PIVOT_Y}px`,
          }}>
          <path d="M27 4V43" stroke="#d9c397" strokeOpacity="0.8" strokeWidth="2.2" />
          <rect x="21.5" y="41" width="11" height="9" rx="2.5" fill="#d9c397" />
          <path d="M24 41V37C24 34.8 30 34.8 30 37V41" stroke="#d9c397" strokeWidth="2" />
          {/* onMouseOver rather than onMouseEnter: React synthesises enter from mouseover and
              mouseout and drops it when relatedTarget is another React-owned element, which is
              what every other path in this SVG is */}
          <circle
            className="new-year-project-ornament-hit"
            cx="27"
            cy="68"
            r="19"
            fill={`url(#${glassId})`}
            onClick={triggerSwing}
            onPointerEnter={triggerSwing}
          />
          <ellipse cx="20.5" cy="60.5" rx="5.5" ry="4" fill="#ffe3e6" fillOpacity="0.46" />
          <path
            d="M14 74C17 80 24 82.5 31 80"
            stroke="#ffb9c2"
            strokeOpacity="0.34"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* A dusting of snow settled on the shoulder of the glass */}
          <path
            d="M15.5 55.5C19 51.5 24 49.5 29 49.8"
            stroke="#fffdfa"
            strokeOpacity="0.4"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </span>
  )
}
