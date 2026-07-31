"use client"

import { useRef } from "react"

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"

import { NewYearModalCloseBell } from "./NewYearModalCloseBell"

const CLOSE_PULL_DISTANCE = 36
/* The bell has two poses rather than following the cursor pixel for pixel: it leans this far
   towards whichever half of the button the pointer is on. Kept small so it reads as weight
   shifting on the cord rather than the bell being shoved */
const LEAN_DEGREES = 9

export function NewYearModalPullClose({ onClose, ariaLabel }: { onClose: () => void; ariaLabel: string }) {
  const pullY = useMotionValue(0)
  const cordHeight = useTransform(pullY, value => 30 + Math.max(0, value))
  const reducedMotion = useReducedMotion()
  /* Which half the pointer was last on, so a move inside the same half writes nothing */
  const leanSideRef = useRef<"left" | "right" | null>(null)

  const resetPull = () => {
    animate(pullY, 0, { type: "spring", stiffness: 420, damping: 28 })
  }

  /* The pointer's half of the button decides the pose: left half leans the bell left, right
     half leans it right. The angle is negated because the bell pivots at the knot above it and
     hangs down — a positive rotation turns clockwise, sending everything below the pivot the
     other way, so the right-hand pose needs a negative angle.

     The property is written only when the side actually changes. Writing it on every pointer
     move restarts the CSS transition from wherever the bell had reached, so it never eases
     anywhere and reads as jitter instead of a lean. One write per crossing lets the full
     150ms ease in theme-new-year.css play out. */
  const leanTowardsPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const side = event.clientX < bounds.left + bounds.width / 2 ? "left" : "right"
    if (side === leanSideRef.current) return

    leanSideRef.current = side
    const lean = side === "left" ? LEAN_DEGREES : -LEAN_DEGREES
    event.currentTarget.style.setProperty("--new-year-bell-lean", `${lean}deg`)
  }

  /* Dropping the property eases the bell back upright through the same 150ms */
  const settleBell = (event: React.PointerEvent<HTMLButtonElement>) => {
    leanSideRef.current = null
    event.currentTarget.style.removeProperty("--new-year-bell-lean")
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="site-modal-close new-year-modal-pull-close"
      onPointerMove={leanTowardsPointer}
      onPointerLeave={settleBell}
      onClick={event => {
        /* Keyboard-generated clicks have detail 0. Pointer users close by pulling the cord. */
        if (event.detail === 0) onClose()
      }}>
      <motion.span className="new-year-modal-close-cord" style={{ height: cordHeight }} aria-hidden="true" />
      <motion.span
        className="new-year-modal-close-handle"
        drag="y"
        dragConstraints={{ top: 0, bottom: 58 }}
        dragElastic={0.04}
        dragMomentum={false}
        style={{ y: pullY }}
        onDragEnd={() => {
          if (pullY.get() >= CLOSE_PULL_DISTANCE) onClose()
          else resetPull()
        }}>
        <NewYearModalCloseBell />
      </motion.span>
    </button>
  )
}
