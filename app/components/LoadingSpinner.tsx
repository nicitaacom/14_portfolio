"use client"

import { motion, useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

interface LoadingSpinnerProps {
  strokeWidth?: number
}

export function LoadingSpinner({ strokeWidth = 2 }: LoadingSpinnerProps) {
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()

  if (theme === "halloween") {
    return (
      <svg
        className="h-[32px] w-[52px]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 78 42"
        aria-hidden="true">
        <motion.g
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 3.6, ease: "linear", repeat: Infinity }}
          style={{ originX: "39px", originY: "21px" }}>
          <path
            d="M39 2 43 8 50 5 51 13 59 14 55 21 62 27 54 31 54 39 46 36 39 41 34 35 26 38 26 30 18 27 24 20 19 13 28 12 30 4Z"
            stroke="#76608e"
          />
          <circle cx="39" cy="21" r="15" stroke="#4d6f50" strokeDasharray="2 5" />
        </motion.g>
        <motion.g
          animate={reduceMotion ? undefined : { y: [0, -2, 0], opacity: [0.76, 1, 0.76] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}>
          <path
            d="M31 19c0-7 3-11 8-11s8 4 8 11v12l-4-3-4 3-4-3-4 3Z"
            fill="#ded7e2"
            stroke="#5d4a6f"
            strokeWidth={strokeWidth}
          />
          <ellipse cx="36" cy="19" rx="1.7" ry="2.3" fill="#0a070d" />
          <ellipse cx="42" cy="19" rx="1.7" ry="2.3" fill="#0a070d" />
          <path d="M37 24c1.3 1 2.7 1 4 0" stroke="#0a070d" strokeLinecap="round" strokeWidth="1.5" />
        </motion.g>
        <motion.circle
          cx="15"
          cy="21"
          r="3"
          fill="#ff7819"
          animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], r: [2.3, 3.4, 2.3] }}
          transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.circle
          cx="63"
          cy="21"
          r="3"
          fill="#76a276"
          animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1], r: [3.4, 2.3, 3.4] }}
          transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
        />
      </svg>
    )
  }

  return (
    <svg
      className="h-[32px] w-[52px]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 78 42"
      aria-hidden="true">
      <defs>
        <linearGradient id="gear-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="hsl(var(--paper))" />
          <stop offset="0.42" stopColor="hsl(var(--brass))" />
          <stop offset="1" stopColor="hsl(var(--steel-deep))" />
        </linearGradient>
      </defs>
      <g className="gearset" transform="translate(39 21)">
        <path
          d="M-6-18H6L8-13L13-14L17-8L14-4L18 1L14 6L17 11L11 16L6 13L1 18L-5 14L-10 17L-16 11L-13 6L-18 1L-14-5L-17-10L-11-16L-6-13Z"
          fill="url(#gear-metal)"
          stroke="hsl(var(--steel-deep))"
          strokeWidth={strokeWidth}
        />
        <circle r="7" fill="hsl(var(--steel-deep))" stroke="hsl(var(--paper) / 0.45)" />
      </g>
      <g className="gearset-reverse" transform="translate(16 29)">
        <path
          d="M-4-11H4L5-8L8-9L11-4L8-2L11 2L8 5L9 8L4 11L2 8L-2 11L-6 8L-5 5L-10 2L-8-2L-10-5L-6-9L-4-8Z"
          fill="url(#gear-metal)"
          stroke="hsl(var(--steel-deep))"
          strokeWidth={strokeWidth}
        />
        <circle r="4" fill="hsl(var(--steel-deep))" />
      </g>
      <g className="gearset-reverse" transform="translate(63 29)">
        <path
          d="M-4-11H4L5-8L8-9L11-4L8-2L11 2L8 5L9 8L4 11L2 8L-2 11L-6 8L-5 5L-10 2L-8-2L-10-5L-6-9L-4-8Z"
          fill="url(#gear-metal)"
          stroke="hsl(var(--steel-deep))"
          strokeWidth={strokeWidth}
        />
        <circle r="4" fill="hsl(var(--steel-deep))" />
      </g>
    </svg>
  )
}
