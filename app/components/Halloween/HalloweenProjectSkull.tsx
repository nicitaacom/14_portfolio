"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

// Wide enough that the long attempt's shifted copies still have room instead of being clipped
const BOX_WIDTH = 320
const BOX_HEIGHT = 116

// Ramps the channel split up and back down over 9 frames, the same shape the boot-screen RGB cycle uses
const SPLIT_MULTIPLIERS = [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]

// One burst is three attempts, each tearing wider than the one before it: two short
// probes in quick succession, then a slower long pull that holds the widest split
const SHORT_ATTEMPTS = [
  { offsets: [4, 6, 8], frameMs: 400 / 9, restMs: 90 },
  { offsets: [10, 12, 14], frameMs: 400 / 9, restMs: 120 },
]

// The long attempt pulls four times as wide as both short probes put together, at twice their speed
const LONG_ATTEMPT = {
  offsets: SHORT_ATTEMPTS[0].offsets.map((offset, index) => (offset + SHORT_ATTEMPTS[1].offsets[index]) * 4),
  frameMs: 200 / 9,
  restMs: 0,
}

const SPLIT_ATTEMPTS = [...SHORT_ATTEMPTS, LONG_ATTEMPT]
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
    let sleepId = 0
    let isOnScreen = true

    let attemptIndex = 0
    let attemptOffset = pick(SPLIT_ATTEMPTS[0].offsets)
    let attemptStartedAt = performance.now() + pick(SPLIT_IDLE_MS)
    const streaks: Streak[] = []
    let nextStreakAt = performance.now() + pick(STREAK_IDLE_MS)

    // Track what the last frame actually wrote, so an unchanged offset skips the style
    // write and an already-blank canvas skips the clear
    let lastOffset = -1
    let hasInk = false

    context.strokeStyle = "#ffffff"
    context.lineCap = "round"

    const drawStreak = (streak: Streak, progress: number) => {
      const head = progress
      const tail = Math.max(0, progress - STREAK_TRAIL)
      const fade = progress < 0.25 ? progress / 0.25 : progress > 0.7 ? (1 - progress) / 0.3 : 1
      const alpha = Math.max(0, Math.min(1, fade)) * 0.85

      context.beginPath()
      for (let sample = 0; sample <= STREAK_SAMPLES; sample += 1) {
        const t = tail + ((head - tail) * sample) / STREAK_SAMPLES
        const point = pointOnCurve(streak, t)
        if (sample === 0) context.moveTo(point.x, point.y)
        else context.lineTo(point.x, point.y)
      }

      // Two strokes over one path fake the glow far cheaper than a real shadowBlur pass
      context.globalAlpha = alpha * 0.26
      context.lineWidth = streak.width * 3.4
      context.stroke()

      context.globalAlpha = alpha
      context.lineWidth = streak.width
      context.stroke()
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

      if (offset !== lastOffset) {
        skull.style.setProperty("--rgb-red-x", `${offset}px`)
        skull.style.setProperty("--rgb-blue-x", `${-offset}px`)
        lastOffset = offset
      }

      if (now >= nextStreakAt) {
        const burst = 2 + Math.floor(Math.random() * 3)
        for (let index = 0; index < burst; index += 1) streaks.push(createStreak(now, centerX, centerY))
        nextStreakAt = now + pick(STREAK_IDLE_MS)
      }

      // Compact in place rather than rebuilding the array on every single frame
      let liveCount = 0
      for (let index = 0; index < streaks.length; index += 1) {
        const streak = streaks[index]
        if (now - streak.startedAt < streak.duration) {
          streaks[liveCount] = streak
          liveCount += 1
        }
      }
      streaks.length = liveCount

      if (liveCount > 0 || hasInk) {
        context.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT)
        for (let index = 0; index < liveCount; index += 1) {
          const streak = streaks[index]
          drawStreak(streak, (now - streak.startedAt) / streak.duration)
        }
        hasInk = liveCount > 0
      }

      // Nothing is moving until the next scheduled event, so stand down instead of
      // holding a 60fps loop open through gaps that run for seconds
      const idleUntil = Math.min(attemptStartedAt, nextStreakAt)
      if (offset === 0 && liveCount === 0 && idleUntil - now > 120) {
        sleepId = window.setTimeout(() => {
          sleepId = 0
          frameId = requestAnimationFrame(animate)
        }, idleUntil - now - 32)
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    const stop = () => {
      cancelAnimationFrame(frameId)
      if (sleepId) window.clearTimeout(sleepId)
      frameId = 0
      sleepId = 0
    }

    // Only burn frames while the card is actually on screen — every project card mounts one of these
    const observer = new IntersectionObserver(
      entries => {
        const nowVisible = entries.some(entry => entry.isIntersecting)
        if (nowVisible === isOnScreen) return

        isOnScreen = nowVisible
        if (nowVisible) frameId = requestAnimationFrame(animate)
        else stop()
      },
      { rootMargin: "120px" },
    )
    observer.observe(canvas)

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      stop()
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
