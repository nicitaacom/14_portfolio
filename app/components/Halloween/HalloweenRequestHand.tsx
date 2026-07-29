"use client"

import { useId } from "react"

import { motion, useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

interface HalloweenRequestHandProps {
  compact?: boolean
  engaged: boolean
}

export function HalloweenRequestHand({ compact = false, engaged }: HalloweenRequestHandProps) {
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()
  const instanceId = useId().replaceAll(":", "")
  const shadowId = `halloween-hand-shadow-${instanceId}`
  const boneId = `halloween-hand-bone-${instanceId}`

  if (theme !== "halloween") return null

  return (
    <span
      className={`halloween-transmission-hand ${compact ? "halloween-transmission-hand-compact" : ""}`}
      aria-hidden="true">
      <svg className="h-full w-full overflow-visible" viewBox="0 0 72 82" fill="none">
        <defs>
          <filter id={shadowId} x="-50%" y="-40%" width="200%" height="210%">
            <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#000" floodOpacity="0.72" />
          </filter>
          <linearGradient id={boneId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff9e9" />
            <stop offset="0.54" stopColor="#d8d0bf" />
            <stop offset="1" stopColor="#958b84" />
          </linearGradient>
        </defs>

        <path
          className="halloween-hand-gate"
          d="M13 69 21 56h30l8 13-7 10H20Z"
          fill="#17101e"
          stroke="#806b91"
          strokeWidth="3"
        />
        <circle cx="36" cy="65" r="9" fill="#08060a" stroke="#ff7819" strokeWidth="3" />
        <circle cx="36" cy="65" r="3" fill="#d8d0bf" />

        <motion.g
          filter={`url(#${shadowId})`}
          initial={false}
          animate={{
            rotate: engaged ? 31 : -27,
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
          style={{ transformBox: "view-box", originX: "36px", originY: "65px" }}>
          <path d="M31 62 27 38M41 62l3-24" stroke={`url(#${boneId})`} strokeLinecap="round" strokeWidth="5" />
          <circle cx="35.5" cy="36" r="7" fill={`url(#${boneId})`} stroke="#62586a" strokeWidth="2" />
          <path
            d="M29 36c-5-6-8-12-7-18m11 17c-3-8-3-16-1-23m6 23c0-9 2-17 6-23m-1 25c5-7 10-12 15-14M29 36c6 4 11 5 17 1"
            stroke={`url(#${boneId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <circle cx="22" cy="18" r="2.6" fill="#e7e1d1" />
          <circle cx="32" cy="12" r="2.6" fill="#e7e1d1" />
          <circle cx="44" cy="12" r="2.6" fill="#e7e1d1" />
          <circle cx="58" cy="23" r="2.6" fill="#e7e1d1" />
        </motion.g>
      </svg>
    </span>
  )
}
