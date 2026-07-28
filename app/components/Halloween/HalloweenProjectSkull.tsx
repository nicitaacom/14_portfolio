"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

const SKULL_SRC = "/UI/halloween/skull.png"

const BOX_WIDTH = 208
const BOX_HEIGHT = 140
const SKULL_WIDTH = 80

// Ramps the channel split up and back down over 9 frames, the same shape the boot-screen RGB cycle uses
const SPLIT_MULTIPLIERS = [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]
const SPLIT_FRAME_MS = 400 / 9
const SPLIT_OFFSETS = [3, 5, 8]
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

// Keeps one colour channel and zeroes the rest so the two layers recombine to the original when unshifted
function buildChannelLayer(image: HTMLImageElement, keepRed: boolean) {
  const layer = document.createElement("canvas")
  layer.width = image.naturalWidth
  layer.height = image.naturalHeight

  const layerContext = layer.getContext("2d")
  if (!layerContext) return null

  layerContext.drawImage(image, 0, 0)

  const imageData = layerContext.getImageData(0, 0, layer.width, layer.height)
  const pixels = imageData.data
  for (let index = 0; index < pixels.length; index += 4) {
    if (keepRed) {
      pixels[index + 1] = 0
      pixels[index + 2] = 0
    } else {
      pixels[index] = 0
    }
  }
  layerContext.putImageData(imageData, 0, 0)

  return layer
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (theme !== "halloween") return

    const canvas = canvasRef.current
    if (!canvas) return

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
    let isReady = false

    const image = new Image()
    image.src = SKULL_SRC

    const start = () => {
      if (cancelled) return

      const skullHeight = Math.round((SKULL_WIDTH * image.naturalHeight) / image.naturalWidth)
      const skullX = centerX - SKULL_WIDTH / 2
      const skullY = centerY - skullHeight / 2

      const redLayer = buildChannelLayer(image, true)
      const cyanLayer = buildChannelLayer(image, false)

      const drawSkull = (offset: number) => {
        if (!redLayer || !cyanLayer) {
          context.drawImage(image, skullX, skullY, SKULL_WIDTH, skullHeight)
          return
        }

        context.globalCompositeOperation = "lighter"
        context.drawImage(redLayer, skullX + offset, skullY, SKULL_WIDTH, skullHeight)
        context.drawImage(cyanLayer, skullX - offset, skullY, SKULL_WIDTH, skullHeight)
        context.globalCompositeOperation = "source-over"
      }

      if (reduceMotion) {
        context.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT)
        drawSkull(0)
        return
      }

      let splitOffset = pick(SPLIT_OFFSETS)
      let splitStartedAt = performance.now() + pick(SPLIT_IDLE_MS)
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

        context.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT)

        let offset = 0
        if (now >= splitStartedAt) {
          const frame = Math.floor((now - splitStartedAt) / SPLIT_FRAME_MS)
          if (frame >= SPLIT_MULTIPLIERS.length) {
            splitOffset = pick(SPLIT_OFFSETS)
            splitStartedAt = now + pick(SPLIT_IDLE_MS)
          } else {
            offset = SPLIT_MULTIPLIERS[frame] * splitOffset
          }
        }

        drawSkull(offset)

        if (now >= nextStreakAt) {
          const burst = 2 + Math.floor(Math.random() * 3)
          for (let index = 0; index < burst; index += 1) streaks.push(createStreak(now, centerX, centerY))
          nextStreakAt = now + pick(STREAK_IDLE_MS)
        }

        streaks = streaks.filter(streak => now - streak.startedAt < streak.duration)
        for (const streak of streaks) drawStreak(streak, (now - streak.startedAt) / streak.duration)

        frameId = requestAnimationFrame(animate)
      }

      frameId = requestAnimationFrame(animate)
    }

    // Only burn frames while the card is actually on screen — every project card mounts one of these
    const observer = new IntersectionObserver(
      entries => {
        const nowVisible = entries.some(entry => entry.isIntersecting)
        if (nowVisible === isOnScreen) return

        isOnScreen = nowVisible
        if (nowVisible) {
          if (isReady) start()
        } else {
          cancelAnimationFrame(frameId)
        }
      },
      { rootMargin: "120px" },
    )
    observer.observe(canvas)

    image
      .decode()
      .then(() => {
        isReady = true
        if (!cancelled && isOnScreen) start()
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [theme, reduceMotion])

  if (theme !== "halloween") return null

  return (
    <div aria-hidden="true" className="halloween-project-skull">
      <canvas ref={canvasRef} />
    </div>
  )
}
