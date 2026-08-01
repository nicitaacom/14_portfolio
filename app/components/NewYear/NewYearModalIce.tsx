"use client"

import { useEffect, useRef } from "react"

import { useSiteTheme } from "@/hooks/useSiteTheme"

/* Target cube edge in CSS pixels, before the grid rounds it to fit the frame exactly */
const CUBE = 19
/* How many cubes deep the wall is stacked. The inner course sits under the modal surface, so only
   its outer half shows - that is what gives the wall thickness instead of a single drawn line. */
const WALL_DEPTH = 2
/* The joint between neighbouring cubes. The frame behind is near-black, so this reads as the dark
   gap that separates the blocks in a full tray. */
const JOINT = 1.6

/* The same deterministic generator the snow canvas uses. The wall is laid once and has to rebuild
   identically on every redraw rather than reshuffling its ice. */
function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function NewYearModalIce() {
  const theme = useSiteTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (theme !== "new-year") return

    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    /* One cube, sitting square on the grid - no rotation, no jitter, column over column.
       The block itself is mostly clear: the near-black frame behind shows straight through it and
       only the frozen crust catches the light. Painting these as solid pale squares is what made
       the last pass look like tiling rather than ice. */
    const drawCube = (x: number, y: number, width: number, height: number, random: () => number) => {
      const shortest = Math.min(width, height)

      const body = context.createLinearGradient(x, y, x + width, y + height)
      body.addColorStop(0, "rgba(163, 203, 228, 0.3)")
      body.addColorStop(0.5, "rgba(48, 86, 118, 0.26)")
      body.addColorStop(1, "rgba(120, 166, 197, 0.24)")
      context.fillStyle = body
      context.fillRect(x, y, width, height)

      context.save()
      context.beginPath()
      context.rect(x, y, width, height)
      context.clip()

      /* The frozen crust. It gathers along the edges and thins toward the middle, so the centre of
         each block stays clear and dark. The depth is redrawn per step, which is what keeps the
         rim ragged instead of turning into a clean border. */
      const step = Math.max(2, shortest / 7)
      const crust = (
        alongX: number,
        alongY: number,
        stepX: number,
        stepY: number,
        depthX: number,
        depthY: number,
        span: number,
      ) => {
        for (let travelled = 0; travelled < span; travelled += step) {
          const depth = shortest * (0.1 + random() * 0.32)
          const originX = alongX + stepX * travelled
          const originY = alongY + stepY * travelled

          context.fillStyle = `rgba(255, 255, 255, ${0.34 + random() * 0.46})`
          context.fillRect(
            depthX < 0 ? originX + depthX * depth : originX,
            depthY < 0 ? originY + depthY * depth : originY,
            stepX !== 0 ? step : depth,
            stepY !== 0 ? step : depth,
          )
        }
      }

      crust(x, y, 1, 0, 0, 1, width)
      crust(x, y + height, 1, 0, 0, -1, width)
      crust(x, y, 0, 1, 1, 0, height)
      crust(x + width, y, 0, 1, -1, 0, height)

      /* A handful of crystal flecks caught inside the clear middle */
      const fleckCount = 2 + Math.floor(random() * 3)
      for (let index = 0; index < fleckCount; index += 1) {
        const fleck = shortest * (0.06 + random() * 0.12)

        context.fillStyle = `rgba(255, 255, 255, ${0.24 + random() * 0.34})`
        context.fillRect(
          x + width * (0.24 + random() * 0.5),
          y + height * (0.24 + random() * 0.5),
          fleck,
          fleck * (0.6 + random() * 0.8),
        )
      }

      /* Fractures run perfectly straight and meet at angles. Curved cracks are what made an
         earlier pass read as slush. */
      const crackCount = 1 + Math.floor(random() * 3)
      for (let index = 0; index < crackCount; index += 1) {
        const startX = x + random() * width

        context.beginPath()
        context.moveTo(startX, y)
        context.lineTo(startX + (random() - 0.5) * width * 0.45, y + height * (0.34 + random() * 0.28))
        context.lineTo(startX + (random() - 0.5) * width * 0.9, y + height)
        context.strokeStyle = `rgba(255, 255, 255, ${0.3 + random() * 0.34})`
        context.lineWidth = 0.8
        context.stroke()
      }

      context.restore()

      /* The lit top and left arrises, then the dark joint that separates one block from the next */
      context.strokeStyle = "rgba(255, 255, 255, 0.66)"
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(x + 0.5, y + height)
      context.lineTo(x + 0.5, y + 0.5)
      context.lineTo(x + width, y + 0.5)
      context.stroke()

      context.strokeStyle = "rgba(5, 16, 27, 0.62)"
      context.lineWidth = 1
      context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1)
    }

    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      const random = createRandom(Math.round(width * 41 + height * 23))

      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)

      /* The grid is stretched to a whole number of cubes each way, so the wall closes on itself at
         every corner with no half block left over */
      const columns = Math.max(WALL_DEPTH * 2 + 1, Math.round(width / CUBE))
      const rows = Math.max(WALL_DEPTH * 2 + 1, Math.round(height / CUBE))
      const cellWidth = width / columns
      const cellHeight = height / rows

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const course = Math.min(column, row, columns - 1 - column, rows - 1 - row)
          if (course >= WALL_DEPTH) continue

          drawCube(
            column * cellWidth + JOINT / 2,
            row * cellHeight + JOINT / 2,
            cellWidth - JOINT,
            cellHeight - JOINT,
            random,
          )
        }
      }
    }

    const resizeObserver = new ResizeObserver(draw)
    resizeObserver.observe(canvas)
    draw()

    return () => resizeObserver.disconnect()
  }, [theme])

  if (theme !== "new-year") return null

  return <canvas ref={canvasRef} className="new-year-modal-ice" aria-hidden="true" />
}
