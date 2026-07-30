"use client"

import { useEffect, useRef } from "react"

import { motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useScopedI18n } from "@/locales/client"

interface GlobeFlake {
  x: number
  y: number
  radius: number
  fall: number
  swirl: number
  phase: number
}

/* How long the snow takes to come to rest after the shake, in milliseconds */
const SETTLE_MS = 4200

export function NewYearBookingLoadingScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()
  const t = useScopedI18n("appointment.modal")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let animationFrame = 0
    let lastFrameTime = performance.now()
    let isRunning = false
    const startedAt = performance.now()

    const flakes: GlobeFlake[] = Array.from({ length: 78 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.9 + Math.random() * 1.9,
      fall: 0.00006 + Math.random() * 0.00007,
      swirl: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    }))

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const drawGlobeSnow = (time: number, elapsed: number) => {
      /* Agitation decays from 1 to 0 over the settle window. It multiplies both the fall speed
         and the lateral swirl, so the snow churns while the globe is still rocking and drifts
         straight down once it has stopped — the shake and the snow tell the same story */
      const agitation = Math.max(0, 1 - (time - startedAt) / SETTLE_MS)
      context.clearRect(0, 0, width, height)

      flakes.forEach(flake => {
        flake.y += flake.fall * (1 + agitation * 5) * elapsed
        if (flake.y > 1.03) {
          flake.y = -0.03
          flake.x = Math.random()
        }

        const swirl = Math.sin(time * 0.0013 + flake.phase) * flake.swirl * (0.01 + agitation * 0.055)
        const px = (flake.x + swirl) * width
        const py = flake.y * height

        context.beginPath()
        context.arc(px, py, flake.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 253, 250, ${0.5 + agitation * 0.35})`
        context.fill()
      })
    }

    const drawFrame = (time: number) => {
      if (!isRunning) return

      const elapsed = Math.min(time - lastFrameTime, 40)
      lastFrameTime = time
      drawGlobeSnow(time, elapsed)
      animationFrame = requestAnimationFrame(drawFrame)
    }

    /* This scene is the content of an open modal, so it deliberately does not test for
       body.modal-open — that class is set the whole time the globe is on screen */
    const isGlobePaused = () => Boolean(reduceMotion) || document.hidden

    const startCanvas = () => {
      if (isRunning || isGlobePaused()) return
      isRunning = true
      lastFrameTime = performance.now()
      animationFrame = requestAnimationFrame(drawFrame)
    }

    const stopCanvas = () => {
      isRunning = false
      cancelAnimationFrame(animationFrame)
    }

    const syncCanvasState = () => {
      if (isGlobePaused()) {
        stopCanvas()
        drawGlobeSnow(performance.now(), 0)
      } else startCanvas()
    }

    const handleResize = () => {
      resizeCanvas()
      if (!isRunning) drawGlobeSnow(performance.now(), 0)
    }

    resizeCanvas()
    syncCanvasState()

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)
    document.addEventListener("visibilitychange", syncCanvasState)

    return () => {
      stopCanvas()
      resizeObserver.disconnect()
      document.removeEventListener("visibilitychange", syncCanvasState)
    }
  }, [reduceMotion])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || reduceMotion) return

    const animationContext = gsap.context(() => {
      /* Someone has just put the globe down: it rocks on its base, each swing shorter than the
         one before, then comes to rest. The base is the pivot, so the origin sits at its foot */
      gsap
        .timeline()
        .set(globe, { transformOrigin: "50% 92%" })
        .fromTo(
          globe,
          { rotation: -4.6, y: -7 },
          { rotation: 4.6, y: 0, duration: 0.34, ease: "sine.inOut", repeat: 5, yoyo: true },
        )
        .to(globe, { rotation: 0, duration: 1.6, ease: "elastic.out(1, 0.38)" })
    }, globe)

    return () => animationContext.revert()
  }, [reduceMotion])

  return (
    <motion.div
      ref={sceneRef}
      role="status"
      aria-live="polite"
      className="appointment-loading-screen new-year-booking-loading-screen absolute inset-[0] z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}>
      <div className="relative z-10 flex h-full min-h-[520px] w-full flex-col items-center justify-center gap-md px-sm py-lg tablet:min-h-[590px] tablet:px-lg">
        <motion.div
          ref={globeRef}
          className="new-year-globe relative w-[92%] max-w-[400px]"
          initial={{ opacity: 0, scale: 0.82, y: -18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.2, 0.88, 0.28, 1.12] }}>
          {/* Interior, under the snow */}
          <svg aria-hidden="true" className="h-auto w-full" viewBox="0 0 420 470" fill="none">
            <defs>
              <clipPath id="new-year-globe-clip">
                <circle cx="210" cy="200" r="160" />
              </clipPath>
              <linearGradient id="new-year-globe-sky" x1="210" y1="40" x2="210" y2="360" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1d3f4d" />
                <stop offset="0.58" stopColor="#123227" />
                <stop offset="1" stopColor="#071d14" />
              </linearGradient>
            </defs>

            <g clipPath="url(#new-year-globe-clip)">
              <circle cx="210" cy="200" r="160" fill="url(#new-year-globe-sky)" />

              {/* A star over the little town */}
              <path d="M210 66L215 84L233 89L215 94L210 112L205 94L187 89L205 84Z" fill="#f7b23b" fillOpacity="0.9" />

              {/* Snow ground */}
              <path
                d="M40 252C104 232 148 268 210 256C272 244 320 272 380 250V380H40Z"
                fill="#eae5d9"
                fillOpacity="0.9"
              />

              {/* House with lit windows */}
              <path d="M145 178H235V254H145Z" fill="#123d2c" />
              <path d="M190 136L252 184H128Z" fill="#8b0f1f" />
              <path d="M128 184C150 176 166 190 190 182C214 174 232 188 252 184" stroke="#fffdfa" strokeWidth="7" />
              <rect x="158" y="198" width="20" height="20" rx="3" fill="#f7b23b" fillOpacity="0.86" />
              <rect x="202" y="198" width="20" height="20" rx="3" fill="#f7b23b" fillOpacity="0.72" />
              <path d="M180 254V226H202V254Z" fill="#79101d" />

              {/* Firs, with snow on their tiers */}
              <path d="M290 152L318 208H262ZM290 186L324 250H256Z" fill="#1d5c40" />
              <path d="M282 250H298V262H282Z" fill="#5a3a22" />
              <path d="M105 190L126 232H84ZM105 214L132 256H78Z" fill="#123d2c" />
              <path d="M98 256H112V264H98Z" fill="#5a3a22" />
            </g>
          </svg>

          {/* Snow. The circular mask on .new-year-globe-snow keeps it inside the glass */}
          <div className="new-year-globe-snow">
            <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
          </div>

          {/* Glass and plinth, over the snow */}
          <svg
            aria-hidden="true"
            className="new-year-globe-shell absolute inset-[0] h-auto w-full"
            viewBox="0 0 420 470"
            fill="none">
            <defs>
              <radialGradient
                id="new-year-globe-glass"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(148 122) scale(268)">
                <stop stopColor="#ffffff" stopOpacity="0.16" />
                <stop offset="0.46" stopColor="#ffffff" stopOpacity="0.04" />
                <stop offset="1" stopColor="#020a07" stopOpacity="0.34" />
              </radialGradient>
              <linearGradient
                id="new-year-globe-base"
                x1="210"
                y1="326"
                x2="210"
                y2="440"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b0f1f" />
                <stop offset="0.52" stopColor="#5e0a16" />
                <stop offset="1" stopColor="#2c0409" />
              </linearGradient>
            </defs>

            <circle cx="210" cy="200" r="160" fill="url(#new-year-globe-glass)" />
            <path
              d="M108 138C126 100 158 74 196 66"
              stroke="#ffffff"
              strokeOpacity="0.3"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <circle cx="210" cy="200" r="160" stroke="#e8dfcd" strokeOpacity="0.44" strokeWidth="4" />

            <path
              d="M120 326H300L322 414C324 428 314 438 300 438H120C106 438 96 428 98 414Z"
              fill="url(#new-year-globe-base)"
              stroke="#d9c397"
              strokeOpacity="0.52"
              strokeWidth="3"
            />
            <path d="M104 358H316" stroke="#d9c397" strokeOpacity="0.44" strokeWidth="5" />
            <path
              d="M126 330C152 322 178 336 210 330C242 324 272 336 296 330"
              stroke="#fffdfa"
              strokeOpacity="0.6"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <motion.p
          className="new-year-booking-status font-holiday text-xs uppercase tracking-[0.18em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduceMotion ? 0.88 : [0.42, 1, 0.42] }}
          transition={{ duration: reduceMotion ? 0 : 1.5, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}>
          {t("booking")}
        </motion.p>
      </div>
    </motion.div>
  )
}
