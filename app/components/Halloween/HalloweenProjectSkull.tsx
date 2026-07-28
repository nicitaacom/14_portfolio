"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

const BOX_WIDTH = 260
const BOX_HEIGHT = 116

// Ramps the channel split up and back down over 9 frames, the same shape the boot-screen RGB cycle uses
const SPLIT_MULTIPLIERS = [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]

// One burst is three attempts, each tearing wider than the one before it: two short
// probes in quick succession, then a slower long pull that holds the widest split
const SPLIT_ATTEMPTS = [
  { offsets: [4, 6, 8], frameMs: 400 / 9, restMs: 90 },
  { offsets: [10, 12, 14], frameMs: 400 / 9, restMs: 120 },
  { offsets: [20, 24, 28], frameMs: 640 / 9, restMs: 0 },
]
const SPLIT_IDLE_MS = [900, 1300, 1800, 2400]

const STREAK_DURATION_MS = [900, 1150, 1400]
const STREAK_IDLE_MS = [1500, 2000, 2600, 3200]
const STREAK_TRAIL = 0.42
const STREAK_SAMPLES = 18

interface Streak {
  startedAt: number
  duration: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  controlX: number
  controlY: number
  width: number
}

function pick<T>(values: T[]) {
  return values[Math.floor(Math.random() * values.length)]
}

function createStreak(now: number, centerX: number, centerY: number): Streak {
  const angle = Math.random() * Math.PI * 2
  const reach = 96 + Math.random() * 74
  const fromX = centerX + Math.cos(angle) * reach
  const fromY = centerY + Math.sin(angle) * reach * 0.72
  const travel = Math.PI * (0.42 + Math.random() * 0.5) * (Math.random() < 0.5 ? -1 : 1)
  const toX = centerX + Math.cos(angle + travel) * reach
  const toY = centerY + Math.sin(angle + travel) * reach * 0.72
  const bow = 0.34 + Math.random() * 0.4

  return {
    startedAt: now,
    duration: pick(STREAK_DURATION_MS),
    fromX,
    fromY,
    toX,
    toY,
    // Pull the control point away from the centre so the line bows outward around the skull
    controlX: centerX + ((fromX + toX) / 2 - centerX) * (1 + bow),
    controlY: centerY + ((fromY + toY) / 2 - centerY) * (1 + bow),
    width: 0.9 + Math.random() * 0.9,
  }
}

function pointOnCurve(streak: Streak, t: number) {
  const inverse = 1 - t
  return {
    x: inverse * inverse * streak.fromX + 2 * inverse * t * streak.controlX + t * t * streak.toX,
    y: inverse * inverse * streak.fromY + 2 * inverse * t * streak.controlY + t * t * streak.toY,
  }
}

export function HalloweenProjectSkull() {
  const skullRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (theme !== "halloween" || reduceMotion) return

    const skull = skullRef.current
    const canvas = canvasRef.current
    if (!skull || !canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(BOX_WIDTH * devicePixelRatio)
    canvas.height = Math.round(BOX_HEIGHT * devicePixelRatio)
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

    const centerX = BOX_WIDTH / 2
    const centerY = BOX_HEIGHT / 2

    let cancelled = false
    let frameId = 0
    let isOnScreen = true

    let attemptIndex = 0
    let attemptOffset = pick(SPLIT_ATTEMPTS[0].offsets)
    let attemptStartedAt = performance.now() + pick(SPLIT_IDLE_MS)
    let streaks: Streak[] = []
    let nextStreakAt = performance.now() + pick(STREAK_IDLE_MS)

    const drawStreak = (streak: Streak, progress: number) => {
      const head = progress
      const tail = Math.max(0, progress - STREAK_TRAIL)
      const fade = progress < 0.25 ? progress / 0.25 : progress > 0.7 ? (1 - progress) / 0.3 : 1

      context.save()
      context.globalAlpha = Math.max(0, Math.min(1, fade)) * 0.85
      context.strokeStyle = "#ffffff"
      context.shadowColor = "#ffffff"
      context.shadowBlur = 7
      context.lineCap = "round"
      context.lineWidth = streak.width
      context.beginPath()

      for (let sample = 0; sample <= STREAK_SAMPLES; sample += 1) {
        const t = tail + ((head - tail) * sample) / STREAK_SAMPLES
        const point = pointOnCurve(streak, t)
        if (sample === 0) context.moveTo(point.x, point.y)
        else context.lineTo(point.x, point.y)
      }

      context.stroke()
      context.restore()
    }

    const animate = (now: number) => {
      if (cancelled) return

      let offset = 0
      if (now >= attemptStartedAt) {
        const attempt = SPLIT_ATTEMPTS[attemptIndex]
        const frame = Math.floor((now - attemptStartedAt) / attempt.frameMs)

        if (frame >= SPLIT_MULTIPLIERS.length) {
          // The last attempt closes the burst, so rest for a full idle gap before probing again
          const wasLastAttempt = attemptIndex === SPLIT_ATTEMPTS.length - 1
          attemptIndex = wasLastAttempt ? 0 : attemptIndex + 1
          attemptOffset = pick(SPLIT_ATTEMPTS[attemptIndex].offsets)
          attemptStartedAt = now + (wasLastAttempt ? pick(SPLIT_IDLE_MS) : attempt.restMs)
        } else {
          offset = SPLIT_MULTIPLIERS[frame] * attemptOffset
        }
      }

      skull.style.setProperty("--rgb-red-x", `${offset}px`)
      skull.style.setProperty("--rgb-blue-x", `${-offset}px`)

      context.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT)

      if (now >= nextStreakAt) {
        const burst = 2 + Math.floor(Math.random() * 3)
        for (let index = 0; index < burst; index += 1) streaks.push(createStreak(now, centerX, centerY))
        nextStreakAt = now + pick(STREAK_IDLE_MS)
      }

      streaks = streaks.filter(streak => now - streak.startedAt < streak.duration)
      for (const streak of streaks) drawStreak(streak, (now - streak.startedAt) / streak.duration)

      frameId = requestAnimationFrame(animate)
    }

    // Only burn frames while the card is actually on screen — every project card mounts one of these
    const observer = new IntersectionObserver(
      entries => {
        const nowVisible = entries.some(entry => entry.isIntersecting)
        if (nowVisible === isOnScreen) return

        isOnScreen = nowVisible
        if (nowVisible) frameId = requestAnimationFrame(animate)
        else cancelAnimationFrame(frameId)
      },
      { rootMargin: "120px" },
    )
    observer.observe(canvas)

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      observer.disconnect()
      skull.style.removeProperty("--rgb-red-x")
      skull.style.removeProperty("--rgb-blue-x")
    }
  }, [theme, reduceMotion])

  if (theme !== "halloween") return null

  return (
    <div aria-hidden="true" className="halloween-project-skull" ref={skullRef}>
      <canvas className="halloween-project-skull-streaks" ref={canvasRef} />
      <span className="rgb-glitch halloween-project-skull-glitch">
        <span className="halloween-project-skull-layer halloween-project-skull-green" />
        <span className="halloween-project-skull-layer halloween-project-skull-red" />
        <span className="halloween-project-skull-layer halloween-project-skull-blue" />
      </span>
    </div>
  )
}
