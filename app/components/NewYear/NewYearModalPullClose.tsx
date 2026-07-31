"use client"

import { animate, motion, useMotionValue, useTransform } from "framer-motion"

import { NewYearModalCloseBell } from "./NewYearModalCloseBell"

const CLOSE_PULL_DISTANCE = 36

export function NewYearModalPullClose({ onClose, ariaLabel }: { onClose: () => void; ariaLabel: string }) {
  const pullY = useMotionValue(0)
  const cordHeight = useTransform(pullY, value => 30 + Math.max(0, value))

  const resetPull = () => {
    animate(pullY, 0, { type: "spring", stiffness: 420, damping: 28 })
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="site-modal-close new-year-modal-pull-close"
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
