"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"

import { useReducedMotion } from "framer-motion"

import { useSiteTheme } from "@/hooks/useSiteTheme"

export interface NavbarWavesHandle {
  setScrollPosition: (scrollPosition: number) => void
}

const GARLAND_BULB_SPACING = 52
/* A four-colour string in the order they come on a real one */
const GARLAND_BULB_COLOURS = ["200, 26, 48", "247, 178, 59", "255, 250, 240", "29, 120, 80"]

export const NavbarWaves = forwardRef<NavbarWavesHandle>(function NavbarWaves(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollPositionRef = useRef(0)
  const theme = useSiteTheme()
  const reducedMotion = useReducedMotion()

  const drawWaves = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const bounds = canvas.getBoundingClientRect()
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    const width = Math.round(bounds.width)
    const height = Math.round(bounds.height)

    if (!width || !height) return

    if (canvas.width !== width * devicePixelRatio || canvas.height !== height * devicePixelRatio) {
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
    }

    const context = canvas.getContext("2d")
    if (!context) return

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)

    if (theme === "halloween") {
      const phase = scrollPositionRef.current * 0.012
      const drawWeb = (originX: number, direction: 1 | -1) => {
        context.save()
        context.translate(originX, 0)
        context.scale(direction, 1)
        context.strokeStyle = "rgba(205, 195, 213, 0.12)"
        context.lineCap = "round"
        context.lineWidth = 1

        for (let index = 0; index < 5; index += 1) {
          context.beginPath()
          context.moveTo(0, 0)
          context.lineTo(70 + index * 16, height * (0.25 + index * 0.17))
          context.stroke()
        }

        for (let ring = 1; ring <= 3; ring += 1) {
          const radius = ring * 34
          context.beginPath()
          context.arc(0, 0, radius, 0.12, Math.PI * 0.48)
          context.stroke()
        }
        context.restore()
      }

      drawWeb(0, 1)
      drawWeb(width, -1)

      const vineY = height * 0.62
      context.beginPath()
      context.moveTo(-20, vineY)
      for (let x = -20; x <= width + 28; x += 28) {
        const y = vineY + Math.sin(x * 0.025 + phase) * 6
        context.lineTo(x, y)
      }
      context.strokeStyle = "rgba(101, 145, 98, 0.26)"
      context.lineWidth = 2.2
      context.stroke()

      for (let x = 18; x < width; x += 54) {
        const y = vineY + Math.sin(x * 0.025 + phase) * 6
        context.beginPath()
        context.ellipse(x, y - 5, 5, 2.3, -0.65, 0, Math.PI * 2)
        context.fillStyle = "rgba(127, 161, 117, 0.17)"
        context.fill()
      }

      for (let index = 0; index < 9; index += 1) {
        const x = ((index * 0.137 * width + phase * 19) % (width + 12)) - 6
        const y = height * (0.18 + ((index * 0.23) % 0.62))
        context.beginPath()
        context.arc(x, y, index % 4 === 0 ? 1.6 : 1, 0, Math.PI * 2)
        context.fillStyle = index % 4 === 0 ? "rgba(255, 120, 25, 0.28)" : "rgba(169, 215, 159, 0.18)"
        context.fill()
      }

      return
    }

    /* The repo strip for this theme. Every other theme fills it with a grid and two sine traces;
       a single light string left most of the band empty at desktop widths, so this paints a whole
       snowy night: a bank of snow along the bottom, distant firs behind it, two light strings at
       different depths and falling snow over the top. Each layer takes the scroll at its own rate,
       which is what gives the band depth. */
    if (theme === "new-year") {
      const time = performance.now()
      const scroll = scrollPositionRef.current

      /* Bulbs keep their colour and twinkle phase as the string travels, because both are keyed to
         an absolute index on the string rather than to a slot in the draw loop */
      const drawLightString = (
        topRatio: number,
        sagRatio: number,
        spacing: number,
        bulbRadius: number,
        scrollRate: number,
        alpha: number,
      ) => {
        const parallax = scroll * scrollRate
        const shift = parallax % spacing
        const wrapCount = Math.floor(parallax / spacing)
        const cordTop = height * topRatio
        const sag = height * sagRatio
        const cordY = (x: number) => {
          const position = Math.min(1, Math.max(0, x / width))
          return cordTop + sag * 4 * position * (1 - position)
        }

        context.beginPath()
        for (let x = -spacing; x <= width + spacing; x += 6) {
          const y = cordY(x)
          if (x === -spacing) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.strokeStyle = `rgba(217, 195, 151, ${0.3 * alpha})`
        context.lineWidth = 1.4
        context.stroke()

        for (let x = -spacing; x <= width + spacing; x += spacing) {
          const bulbX = x - shift
          const anchorY = cordY(bulbX)
          const bulbIndex = x / spacing + wrapCount
          const colour = GARLAND_BULB_COLOURS[Math.abs(bulbIndex) % GARLAND_BULB_COLOURS.length]
          const twinkle = 0.55 + 0.45 * Math.sin(time * 0.0016 + bulbIndex * 1.9)

          context.beginPath()
          context.moveTo(bulbX, anchorY)
          context.lineTo(bulbX, anchorY + bulbRadius * 1.5)
          context.strokeStyle = `rgba(217, 195, 151, ${0.32 * alpha})`
          context.lineWidth = 1.2
          context.stroke()

          const glowY = anchorY + bulbRadius * 2.8
          context.beginPath()
          context.arc(bulbX, glowY, bulbRadius * 2.9, 0, Math.PI * 2)
          context.fillStyle = `rgba(${colour}, ${0.1 * twinkle * alpha})`
          context.fill()

          context.beginPath()
          context.arc(bulbX, glowY, bulbRadius, 0, Math.PI * 2)
          context.fillStyle = `rgba(${colour}, ${(0.42 + 0.34 * twinkle) * alpha})`
          context.fill()
        }
      }

      const bankTop = height * 0.82

      /* Distant firs, behind the snow bank and drifting at a quarter of the scroll rate */
      const firParallax = (scroll * 0.015) % 260
      for (let index = -1; index < Math.ceil(width / 260) + 1; index += 1) {
        const firX = index * 260 - firParallax + 130
        const firHeight = height * (index % 2 === 0 ? 0.4 : 0.31)
        const halfWidth = firHeight * 0.42
        context.beginPath()
        context.moveTo(firX, bankTop - firHeight)
        context.lineTo(firX + halfWidth, bankTop + 4)
        context.lineTo(firX - halfWidth, bankTop + 4)
        context.closePath()
        context.fillStyle = "rgba(16, 52, 37, 0.85)"
        context.fill()
        context.beginPath()
        context.moveTo(firX - halfWidth * 0.62, bankTop - firHeight * 0.34)
        context.quadraticCurveTo(firX, bankTop - firHeight * 0.46, firX + halfWidth * 0.62, bankTop - firHeight * 0.34)
        context.strokeStyle = "rgba(253, 251, 246, 0.4)"
        context.lineWidth = 3
        context.lineCap = "round"
        context.stroke()
      }

      /* The bank of snow the whole strip sits on */
      context.beginPath()
      context.moveTo(-4, height + 4)
      for (let x = -4; x <= width + 4; x += 18) {
        context.lineTo(x, bankTop + Math.sin(x * 0.008 + 0.6) * 5)
      }
      context.lineTo(width + 4, height + 4)
      context.closePath()
      context.fillStyle = "rgba(247, 244, 236, 0.9)"
      context.fill()

      drawLightString(0.1, 0.16, 64, 2.2, 0.03, 0.6)
      drawLightString(0.24, 0.3, 52, 3.1, 0.06, 1)

      /* Falling snow over everything. The index drives both the column and the phase, so the field
         reads as scattered rather than as a marching row */
      for (let index = 0; index < 46; index += 1) {
        const columnSeed = (index * 0.6180339887) % 1
        const drift = Math.sin(time * 0.0004 + index * 1.7) * 14
        const flakeX = columnSeed * width + drift
        const fallSpan = height * 0.94
        const flakeY = ((index * 0.317 + time * 0.000045) % 1) * fallSpan
        const flakeRadius = index % 5 === 0 ? 1.9 : index % 3 === 0 ? 1.4 : 0.9
        context.beginPath()
        context.arc(flakeX, flakeY, flakeRadius, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 253, 250, ${index % 5 === 0 ? 0.78 : 0.5})`
        context.fill()
      }

      return
    }

    const gridSpacing = 28
    context.strokeStyle = "rgba(220, 210, 230, 0.055)"
    context.lineWidth = 1

    for (let x = 0; x <= width; x += gridSpacing) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }

    for (let y = 0; y <= height; y += gridSpacing) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }

    const phase = scrollPositionRef.current * 0.038
    const drawTrace = ({
      amplitude,
      period,
      offset,
      rotation,
      strokeStyle,
    }: {
      amplitude: number
      period: number
      offset: number
      rotation: number
      strokeStyle: string
    }) => {
      context.save()
      context.translate(width / 2, height / 2)
      context.rotate((rotation * Math.PI) / 180)
      context.translate(-width / 2, -height / 2)
      context.beginPath()

      for (let x = -height; x <= width + height; x += 2) {
        const y = height / 2 + Math.sin((x / period) * Math.PI * 2 + phase + offset) * amplitude
        if (x === -height) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.strokeStyle = strokeStyle
      context.lineWidth = 1.2
      context.stroke()
      context.restore()
    }

    drawTrace({
      amplitude: height * 0.22,
      period: 138,
      offset: 0,
      rotation: -4,
      strokeStyle: "rgba(238, 234, 244, 0.075)",
    })
    drawTrace({
      amplitude: height * 0.14,
      period: 94,
      offset: Math.PI / 2,
      rotation: 5.5,
      strokeStyle: "rgba(238, 234, 244, 0.055)",
    })
  }, [theme])

  useImperativeHandle(
    ref,
    () => ({
      setScrollPosition(scrollPosition) {
        scrollPositionRef.current = scrollPosition
        drawWaves()
      },
    }),
    [drawWaves],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(drawWaves)
    resizeObserver.observe(canvas)
    drawWaves()

    return () => resizeObserver.disconnect()
  }, [drawWaves])

  /* Every other theme draws this canvas only on scroll and on resize. The bulbs twinkle on a
       clock instead, so the New Year branch needs a frame loop of its own — held at about
       24fps because the twinkle period is measured in seconds, and stopped whenever a modal is
       open, the tab is hidden or the visitor asked for reduced motion. Under reduced motion the
       string still paints once from the effect above, so the lights are lit but still */
  useEffect(() => {
    if (theme !== "new-year") return

    let animationFrame = 0
    let lastDrawTime = 0
    let isRunning = false

    const isGarlandPaused = () =>
      Boolean(reducedMotion) || document.hidden || document.body.classList.contains("modal-open")

    const step = (time: number) => {
      if (!isRunning) return
      if (time - lastDrawTime >= 42) {
        lastDrawTime = time
        drawWaves()
      }
      animationFrame = requestAnimationFrame(step)
    }

    const startGarland = () => {
      if (isRunning || isGarlandPaused()) return
      isRunning = true
      animationFrame = requestAnimationFrame(step)
    }

    const stopGarland = () => {
      isRunning = false
      cancelAnimationFrame(animationFrame)
    }

    const syncGarlandState = () => {
      if (isGarlandPaused()) stopGarland()
      else startGarland()
    }

    syncGarlandState()

    const bodyObserver = new MutationObserver(syncGarlandState)
    bodyObserver.observe(document.body, { attributeFilter: ["class"], attributes: true })
    document.addEventListener("visibilitychange", syncGarlandState)

    return () => {
      stopGarland()
      bodyObserver.disconnect()
      document.removeEventListener("visibilitychange", syncGarlandState)
    }
  }, [drawWaves, reducedMotion, theme])

  return <canvas ref={canvasRef} className="navbar-wave-canvas" aria-hidden="true" />
})
