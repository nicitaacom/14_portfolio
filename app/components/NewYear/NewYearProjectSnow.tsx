"use client"

import { useEffect, useRef } from "react"

import { useSiteTheme } from "@/hooks/useSiteTheme"

interface SnowBank {
  y: number
  depth: number
  direction: "down" | "up"
}

const SNOW_AMOUNT = 1.4

/* A deterministic generator keeps the individual snow grains in the same place after redraws.
   The card should look snow-covered, not as though a new texture is flashing in on every resize. */
function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function NewYearProjectSnow() {
  const theme = useSiteTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (theme !== "new-year") return

    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const drawBank = (width: number, bank: SnowBank, random: () => number) => {
      const step = 8

      context.beginPath()
      context.moveTo(0, bank.y)

      for (let x = 0; x <= width + step; x += step) {
        const wave = Math.sin(x * 0.035 + bank.y * 0.018) * 0.16 + Math.sin(x * 0.091 + 1.4) * 0.1
        const irregularity = (random() - 0.5) * 0.06
        const edge = bank.depth * (0.56 + wave + irregularity)
        context.lineTo(x, bank.y + (bank.direction === "down" ? edge : -edge))
      }

      context.lineTo(width, bank.y)
      context.closePath()

      const gradient = context.createLinearGradient(
        0,
        bank.direction === "down" ? bank.y : bank.y - bank.depth,
        0,
        bank.direction === "down" ? bank.y + bank.depth : bank.y,
      )
      gradient.addColorStop(0, "#fcfeff")
      gradient.addColorStop(0.56, "#e5f1f8")
      gradient.addColorStop(1, "#adcddd")
      context.fillStyle = gradient
      context.fill()

      /* The bank is made from visible grains rather than a flat CSS wave. Most grains sit close
         to the supporting ledge, with a few larger clumps along the uneven outer edge. */
      const grainCount = Math.max(20, Math.round((width * bank.depth) / 115))
      for (let index = 0; index < grainCount; index += 1) {
        const spacing = width / grainCount
        const x = (index + 0.5) * spacing + (random() - 0.5) * spacing * 0.28
        const distance = Math.pow(0.16 + random() * 0.72, 1.65) * bank.depth
        const y = bank.y + (bank.direction === "down" ? distance : -distance)
        const radius = 0.85 + random() * 1.15

        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(249, 253, 255, ${0.3 + random() * 0.5})`
        context.fill()
      }
    }

    const drawSideBank = (width: number, height: number, side: "left" | "right") => {
      const edgeX = side === "left" ? 0 : width
      const direction = side === "left" ? 1 : -1
      const depth = 11 * SNOW_AMOUNT

      context.beginPath()
      context.moveTo(edgeX, 0)
      context.lineTo(edgeX, height)

      for (let y = height; y >= 0; y -= 9) {
        const wave = Math.sin(y * 0.041 + (side === "left" ? 0.6 : 2.1)) * 0.18 + Math.sin(y * 0.097) * 0.1
        context.lineTo(edgeX + direction * depth * (0.58 + wave), y)
      }

      context.closePath()

      const gradient = context.createLinearGradient(edgeX, 0, edgeX + direction * depth, 0)
      gradient.addColorStop(0, "#fafeff")
      gradient.addColorStop(0.58, "#e2f0f8")
      gradient.addColorStop(1, "#a8cadc")
      context.fillStyle = gradient
      context.fill()
    }

    const drawIcicles = (width: number, random: () => number) => {
      const spacing = 30
      const count = Math.max(8, Math.floor(width / spacing))
      const actualSpacing = width / count

      for (let index = 0; index < count; index += 1) {
        const x = (index + 0.5) * actualSpacing
        const rootY = 7
        const length = (9 + random() * 19) * SNOW_AMOUNT
        const halfWidth = 2.1 + random() * 1.8
        const gradient = context.createLinearGradient(x - halfWidth, rootY, x + halfWidth, rootY + length)

        gradient.addColorStop(0, "rgba(246, 253, 255, 0.88)")
        gradient.addColorStop(0.48, "rgba(187, 224, 241, 0.76)")
        gradient.addColorStop(1, "rgba(113, 175, 207, 0.5)")

        context.beginPath()
        context.moveTo(x - halfWidth, rootY)
        context.quadraticCurveTo(x - halfWidth * 0.7, rootY + length * 0.55, x, rootY + length)
        context.quadraticCurveTo(x + halfWidth * 0.72, rootY + length * 0.54, x + halfWidth, rootY)
        context.closePath()
        context.fillStyle = gradient
        context.fill()

        context.beginPath()
        context.moveTo(x - halfWidth * 0.35, rootY + 2)
        context.lineTo(x - halfWidth * 0.12, rootY + length * 0.72)
        context.strokeStyle = "rgba(255, 255, 255, 0.46)"
        context.lineWidth = 0.8
        context.stroke()
      }
    }

    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      const random = createRandom(Math.round(width * 31 + height * 17))

      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)

      const banks: SnowBank[] = [
        /* One continuous perimeter coating: a top bank and its deeper bottom accumulation */
        { y: 1, depth: 16 * SNOW_AMOUNT, direction: "down" },
        { y: height - 1, depth: 24 * SNOW_AMOUNT, direction: "up" },
      ]

      drawIcicles(width, random)
      banks.forEach(bank => drawBank(width, bank, random))
      drawSideBank(width, height, "left")
      drawSideBank(width, height, "right")

      /* A dense granular rim makes all four sides of the Project frame look packed with snow.
         Horizontal edges carry more weight, while the side grains read as compacted icy crust. */
      const perimeter = 2 * (width + height)
      const borderGrainCount = Math.min(640, Math.max(250, Math.round((perimeter / 9) * SNOW_AMOUNT)))
      for (let index = 0; index < borderGrainCount; index += 1) {
        let distance = ((index + 0.5) / borderGrainCount) * perimeter
        const inset = 2.5 + (Math.sin(index * 1.71) + 1) * 2.2
        let x = 0
        let y = 0

        if (distance <= width) {
          x = distance
          y = inset
        } else if ((distance -= width) <= height) {
          x = width - inset
          y = distance
        } else if ((distance -= height) <= width) {
          x = width - distance
          y = height - inset
        } else {
          distance -= width
          x = inset
          y = height - distance
        }

        const radius = 1.05 + (Math.sin(index * 2.37 + 0.4) + 1) * 0.42

        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(239, 249, 254, ${0.62 + Math.sin(index * 1.19) * 0.12})`
        context.fill()
      }
    }

    const resizeObserver = new ResizeObserver(draw)
    resizeObserver.observe(canvas)
    draw()

    return () => resizeObserver.disconnect()
  }, [theme])

  if (theme !== "new-year") return null

  return <canvas ref={canvasRef} className="new-year-project-snow" aria-hidden="true" />
}
