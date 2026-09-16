"use client"

import { useEffect, useRef } from "react"

function noise(x: number, y: number, salt: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453123
  return value - Math.floor(value)
}

/** A deterministic, non-repeating metal-stud field for the console background. */
export function RandomDotReliefCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const element = canvas.current
    if (!element) return

    const draw = () => {
      const { width, height } = element.getBoundingClientRect()
      // Render above the screen density, then downsample for smooth sub-pixel metal highlights.
      const ratio = Math.min(Math.max(window.devicePixelRatio || 1, 3), 3)
      element.width = Math.round(width * ratio)
      element.height = Math.round(height * ratio)
      const context = element.getContext("2d")
      if (!context) return
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      const theme = getComputedStyle(document.documentElement)
      const color = (name: string) => theme.getPropertyValue(name).trim() || "transparent"
      const shadow = color("--3d-dot-c-050708")
      const highlight = color("--3d-dot-c-f2f6f8")
      const midtone = color("--3d-dot-c-a2adb4")
      const base = color("--3d-dot-c-15191c")

      const step = 10.2
      for (let row = -1; row < height / step + 1; row++) {
        for (let column = -1; column < width / step + 1; column++) {
          const jitterX = (noise(column, row, 1) - 0.5) * 2.3
          const jitterY = (noise(column, row, 2) - 0.5) * 2.3
          const x = column * step + jitterX
          const y = row * step + jitterY
          const wave = (Math.sin(column * 0.073 + Math.sin(row * 0.051) * 2.4) + 1) / 2
          const grain = noise(column, row, 3)
          const strength = 0.32 + wave * 0.5 + grain * 0.18
          const radius = 0.65 + strength * 1.65

          context.beginPath()
          context.arc(x + radius * 0.45, y + radius * 0.65, radius + 0.5, 0, Math.PI * 2)
          context.globalAlpha = 0.42 + strength * 0.28
          context.fillStyle = shadow
          context.fill()

          const gradient = context.createRadialGradient(x - radius * 0.38, y - radius * 0.45, radius * 0.12, x, y, radius)
          gradient.addColorStop(0, highlight)
          gradient.addColorStop(0.34, midtone)
          gradient.addColorStop(1, base)
          context.beginPath()
          context.arc(x, y, radius, 0, Math.PI * 2)
          context.globalAlpha = 0.34 + strength * 0.46
          context.fillStyle = gradient
          context.fill()
        }
      }
      context.globalAlpha = 1
    }

    const observer = new ResizeObserver(draw)
    observer.observe(element)
    draw()
    return () => observer.disconnect()
  }, [])

  return <canvas ref={canvas} className="block h-full w-full" aria-hidden="true" />
}
