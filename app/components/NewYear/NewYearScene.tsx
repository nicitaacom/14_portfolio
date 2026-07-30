"use client"

import { useEffect, useRef } from "react"

import { motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useSiteTheme } from "@/hooks/useSiteTheme"

interface Snowflake {
  x: number
  y: number
  radius: number
  sway: number
  phase: number
}

interface SnowLayer {
  flakes: Snowflake[]
  fall: number
  windScale: number
  opacity: number
  halo: boolean
}

/* Three depths. `fall` is normalised height per millisecond, so a near flake crosses the
   viewport in about 9s and a far one in about 22s regardless of how tall the window is */
const LAYER_SPECS = [
  { count: 44, minRadius: 0.6, spread: 0.5, fall: 0.0000455, windScale: 0.35, opacity: 0.34, halo: false },
  { count: 30, minRadius: 1.2, spread: 0.7, fall: 0.0000714, windScale: 0.62, opacity: 0.55, halo: false },
  { count: 16, minRadius: 2.2, spread: 1.1, fall: 0.000111, windScale: 1, opacity: 0.8, halo: true },
]

/* Points sampled off the catenary the bulb string hangs on. The x values are evenly spaced
   because the quadratic's three x controls are, so only y needs the curve: 140 + 184t(1-t) */
const BULBS = [
  { x: 496, y: 156.6 },
  { x: 552, y: 169.4 },
  { x: 608, y: 178.6 },
  { x: 664, y: 184.2 },
  { x: 720, y: 186 },
  { x: 776, y: 184.2 },
  { x: 832, y: 178.6 },
  { x: 888, y: 169.4 },
  { x: 944, y: 156.6 },
]

/* Lit windows in the far town. Kept dim: the town is across the street, not in the room */
const TOWN_LIGHTS = [
  { x: 524, y: 404 },
  { x: 566, y: 382 },
  { x: 614, y: 368 },
  { x: 660, y: 400 },
  { x: 712, y: 376 },
  { x: 754, y: 408 },
  { x: 800, y: 384 },
  { x: 846, y: 406 },
  { x: 896, y: 374 },
  { x: 938, y: 406 },
]

function isAmbientMotionPaused(reducedMotion: boolean | null) {
  return Boolean(reducedMotion) || document.hidden || document.body.classList.contains("modal-open")
}

function createLayers(): SnowLayer[] {
  return LAYER_SPECS.map(spec => ({
    fall: spec.fall,
    windScale: spec.windScale,
    opacity: spec.opacity,
    halo: spec.halo,
    flakes: Array.from({ length: spec.count }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: spec.minRadius + Math.random() * spec.spread,
      sway: 0.004 + Math.random() * 0.008,
      phase: Math.random() * Math.PI * 2,
    })),
  }))
}

export function NewYearScene() {
  const theme = useSiteTheme()
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (theme !== "new-year") return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let animationFrame = 0
    let lastFrameTime = performance.now()
    let isRunning = false

    const layers = createLayers()

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    /* Two sine terms of different periods, so the gust never settles into one repeating
       slant — that is what makes it read as weather instead of a scrolling tile */
    const windAt = (time: number) => Math.sin(time * 0.00012) * 0.6 + Math.sin(time * 0.00037 + 1.7) * 0.28

    const drawSnow = (time: number, elapsed: number) => {
      const wind = windAt(time)
      context.clearRect(0, 0, width, height)

      layers.forEach(layer => {
        const lateral = wind * layer.windScale * 0.00004 * elapsed

        layer.flakes.forEach(flake => {
          flake.y += layer.fall * elapsed
          flake.x += lateral

          if (flake.y > 1.04) {
            flake.y = -0.04
            flake.x = Math.random()
          }
          if (flake.x < -0.06) flake.x += 1.12
          if (flake.x > 1.06) flake.x -= 1.12

          const px = (flake.x + Math.sin(time * 0.0009 + flake.phase) * flake.sway) * width
          const py = flake.y * height

          if (layer.halo) {
            context.beginPath()
            context.arc(px, py, flake.radius * 2.6, 0, Math.PI * 2)
            context.fillStyle = `rgba(255, 253, 250, ${layer.opacity * 0.16})`
            context.fill()
          }

          context.beginPath()
          context.arc(px, py, flake.radius, 0, Math.PI * 2)
          context.fillStyle = `rgba(255, 253, 250, ${layer.opacity})`
          context.fill()
        })
      })
    }

    const drawFrame = (time: number) => {
      if (!isRunning) return

      const elapsed = Math.min(time - lastFrameTime, 40)
      lastFrameTime = time
      drawSnow(time, elapsed)
      animationFrame = requestAnimationFrame(drawFrame)
    }

    const startCanvas = () => {
      if (isRunning || isAmbientMotionPaused(reducedMotion)) return
      isRunning = true
      lastFrameTime = performance.now()
      animationFrame = requestAnimationFrame(drawFrame)
    }

    const stopCanvas = () => {
      isRunning = false
      cancelAnimationFrame(animationFrame)
    }

    const syncCanvasState = () => {
      if (isAmbientMotionPaused(reducedMotion)) {
        stopCanvas()
        /* One still frame, so a paused or reduced-motion visitor still sees snow in the air
           rather than an empty canvas */
        drawSnow(performance.now(), 0)
      } else startCanvas()
    }

    const handleResize = () => {
      resizeCanvas()
      if (!isRunning) drawSnow(performance.now(), 0)
    }

    resizeCanvas()
    syncCanvasState()

    const resizeObserver = new ResizeObserver(handleResize)
    const bodyObserver = new MutationObserver(syncCanvasState)
    resizeObserver.observe(canvas)
    bodyObserver.observe(document.body, { attributeFilter: ["class"], attributes: true })
    document.addEventListener("visibilitychange", syncCanvasState)

    return () => {
      stopCanvas()
      resizeObserver.disconnect()
      bodyObserver.disconnect()
      document.removeEventListener("visibilitychange", syncCanvasState)
    }
  }, [reducedMotion, theme])

  useEffect(() => {
    const sceneElement = sceneRef.current
    if (theme !== "new-year" || !sceneElement) return

    const animationContext = gsap.context(() => {
      if (reducedMotion) {
        gsap.set("[data-new-year-flame]", { opacity: 0.92, scaleY: 1 })
        gsap.set("[data-new-year-bauble]", { rotation: 0 })
        gsap.set("[data-new-year-bokeh]", { opacity: 0.3 })
        return
      }

      /* One tween per bauble, so svgOrigin receives a literal user-space coordinate pair
         rather than a function. svgOrigin is the one origin mechanism that ignores the
         element's own bounding box, so a bauble swings from the knot its string is tied to
         instead of orbiting its bbox corner. Each bauble states that knot in data-pivot */
      sceneElement.querySelectorAll<SVGGElement>("[data-new-year-bauble]").forEach((bauble, index) => {
        gsap.fromTo(
          bauble,
          { rotation: -3.2 },
          {
            rotation: 3.2,
            svgOrigin: bauble.dataset.pivot ?? "0 0",
            duration: 2.6,
            delay: index * 0.42,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        )
      })
      gsap.to("[data-new-year-flame]", {
        opacity: 0.62,
        scaleX: 0.86,
        scaleY: 1.14,
        transformOrigin: "50% 100%",
        duration: 0.19,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.07,
      })
      gsap.to("[data-new-year-bokeh]", {
        opacity: 0.46,
        scale: 1.12,
        transformOrigin: "50% 50%",
        duration: 2.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.31, from: "random" },
      })
      gsap.to("[data-new-year-bulb]", {
        opacity: 0.55,
        duration: 1.7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.23, from: "random" },
      })
      gsap.to("[data-new-year-window-pool]", {
        opacity: 0.74,
        duration: 4.3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
    }, sceneRef)

    const syncTimelineState = () => {
      const shouldPause = document.hidden || document.body.classList.contains("modal-open")
      const sceneTweens = animationContext.getTweens() as gsap.core.Tween[]
      sceneTweens.forEach(tween => tween.paused(shouldPause))
    }

    const bodyObserver = new MutationObserver(syncTimelineState)
    bodyObserver.observe(document.body, { attributeFilter: ["class"], attributes: true })
    document.addEventListener("visibilitychange", syncTimelineState)
    syncTimelineState()

    return () => {
      bodyObserver.disconnect()
      document.removeEventListener("visibilitychange", syncTimelineState)
      animationContext.revert()
    }
  }, [reducedMotion, theme])

  if (theme !== "new-year") return null

  return (
    <motion.div
      ref={sceneRef}
      className="new-year-scene absolute inset-[0]"
      initial={false}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}>
      <svg
        aria-hidden="true"
        className="new-year-interior-svg absolute inset-[0] h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        fill="none">
        <defs>
          <linearGradient id="new-year-room" x1="720" y1="0" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0c3123" />
            <stop offset="0.54" stopColor="#071e15" />
            <stop offset="1" stopColor="#03110b" />
          </linearGradient>
          {/* The one place a cold hue belongs: the night outside the glass */}
          <linearGradient id="new-year-night" x1="720" y1="86" x2="720" y2="478" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1d3f4d" />
            <stop offset="0.62" stopColor="#16303a" />
            <stop offset="1" stopColor="#12262d" />
          </linearGradient>
          <linearGradient id="new-year-drift" x1="720" y1="700" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f4f1e8" stopOpacity="0.17" />
            <stop offset="1" stopColor="#f4f1e8" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="new-year-bauble-red" cx="0" cy="0" r="1" gradientTransform="translate(-8 -9) scale(34)">
            <stop stopColor="#f4566a" />
            <stop offset="0.42" stopColor="#c81a30" />
            <stop offset="1" stopColor="#79101d" />
          </radialGradient>
          <radialGradient id="new-year-pool" cx="0" cy="0" r="1" gradientTransform="translate(720 470) scale(520 380)">
            <stop stopColor="#f7b23b" stopOpacity="0.3" />
            <stop offset="0.5" stopColor="#f7b23b" stopOpacity="0.1" />
            <stop offset="1" stopColor="#f7b23b" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id="new-year-vignette"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(720 400) scale(980 720)">
            <stop stopColor="#03110b" stopOpacity="0" />
            <stop offset="0.7" stopColor="#03110b" stopOpacity="0" />
            <stop offset="1" stopColor="#03110b" stopOpacity="0.62" />
          </radialGradient>
          <filter id="new-year-bokeh-blur" x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="17" />
          </filter>
          <filter id="new-year-bulb-blur" x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="new-year-window-clip">
            <rect x="474" y="92" width="492" height="380" rx="11" />
          </clipPath>
        </defs>

        <rect width="1440" height="900" fill="url(#new-year-room)" />

        {/* Window onto the street: cold glass, a dim town, snow on the far roofs */}
        <g>
          <rect x="468" y="86" width="504" height="392" rx="14" fill="url(#new-year-night)" />
          <g clipPath="url(#new-year-window-clip)">
            <path
              d="M474 472V402H512V376H556V408H604V360H626L648 332L670 360H692V394H742V368H790V400H836V372H884V402H930V376H966V472H474Z"
              fill="#0d2028"
              fillOpacity="0.92"
            />
            {TOWN_LIGHTS.map(light => (
              <rect
                key={`${light.x}-${light.y}`}
                x={light.x}
                y={light.y}
                width="9"
                height="12"
                rx="2"
                fill="#f7b23b"
                fillOpacity="0.44"
              />
            ))}
            <path
              d="M474 452C556 438 634 448 720 440C806 432 892 446 966 436V472H474V452Z"
              fill="#e8e4d8"
              fillOpacity="0.2"
            />
          </g>
          <path
            d="M720 86V478M468 282H972"
            stroke="#e8dfcd"
            strokeOpacity="0.34"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <rect
            x="468"
            y="86"
            width="504"
            height="392"
            rx="14"
            stroke="#efe7d7"
            strokeOpacity="0.46"
            strokeWidth="13"
          />
        </g>

        {/* Amber pooling on the floor below the sill — the room's own light, never a fill */}
        <ellipse
          data-new-year-window-pool
          cx="720"
          cy="470"
          rx="520"
          ry="380"
          fill="url(#new-year-pool)"
          opacity="0.5"
        />

        {/* Fairy-light string sagging across the window head */}
        <path d="M440 140Q720 232 1000 140" stroke="#d9c397" strokeOpacity="0.5" strokeWidth="3" />
        {BULBS.map(bulb => (
          <g key={bulb.x}>
            <circle
              data-new-year-bokeh
              cx={bulb.x}
              cy={bulb.y + 12}
              r="19"
              fill="#f7b23b"
              opacity="0.3"
              filter="url(#new-year-bokeh-blur)"
            />
            <circle
              data-new-year-bulb
              cx={bulb.x}
              cy={bulb.y + 12}
              r="7"
              fill="#ffd489"
              opacity="0.9"
              filter="url(#new-year-bulb-blur)"
            />
          </g>
        ))}

        {/* Fir boughs reaching in from the top corners, straight from the watercolour */}
        <g stroke="#1d5c40" strokeWidth="7" strokeLinecap="round" transform="translate(-30 -24)">
          <path d="M0 0C90 26 180 62 300 104" strokeWidth="9" />
          <path d="M40 12L18 44M40 12L62 40M78 26L54 60M78 26L100 54M118 40L92 74M118 40L140 68M158 55L132 88M158 55L180 82M198 70L172 102M198 70L220 96M238 85L212 116M238 85L260 110M276 98L250 128M276 98L296 122" />
        </g>
        <g stroke="#123d2c" strokeWidth="6" strokeLinecap="round" transform="translate(-40 46)">
          <path d="M0 0C74 18 138 44 212 74" strokeWidth="8" />
          <path d="M34 9L16 36M34 9L54 32M70 21L50 50M70 21L90 44M108 36L86 64M108 36L128 58M146 51L124 78M146 51L166 72M184 64L164 90" />
        </g>
        <g stroke="#1d5c40" strokeWidth="7" strokeLinecap="round" transform="translate(1470 -24) scale(-1 1)">
          <path d="M0 0C90 26 180 62 300 104" strokeWidth="9" />
          <path d="M40 12L18 44M40 12L62 40M78 26L54 60M78 26L100 54M118 40L92 74M118 40L140 68M158 55L132 88M158 55L180 82M198 70L172 102M198 70L220 96M238 85L212 116M238 85L260 110M276 98L250 128M276 98L296 122" />
        </g>

        {/* Baubles. data-pivot is the knot the string hangs from, in user-space units */}
        <g data-new-year-bauble data-pivot="118 96">
          <path d="M118 96V140" stroke="#d9c397" strokeOpacity="0.72" strokeWidth="2.5" />
          <rect x="112" y="138" width="12" height="9" rx="2" fill="#d9c397" />
          <circle cx="118" cy="168" r="22" fill="url(#new-year-bauble-red)" />
          <circle cx="110" cy="159" r="6" fill="#ffe3e6" fillOpacity="0.5" />
        </g>
        <g data-new-year-bauble data-pivot="212 132">
          <path d="M212 132V170" stroke="#d9c397" strokeOpacity="0.72" strokeWidth="2.5" />
          <rect x="207" y="168" width="10" height="8" rx="2" fill="#d9c397" />
          <circle cx="212" cy="192" r="16" fill="url(#new-year-bauble-red)" />
          <circle cx="206" cy="186" r="4.5" fill="#ffe3e6" fillOpacity="0.5" />
        </g>
        <g data-new-year-bauble data-pivot="58 62">
          <path d="M58 62V98" stroke="#d9c397" strokeOpacity="0.72" strokeWidth="2.2" />
          <circle cx="58" cy="114" r="13" fill="url(#new-year-bauble-red)" />
          <circle cx="53" cy="109" r="3.6" fill="#ffe3e6" fillOpacity="0.5" />
        </g>
        <g data-new-year-bauble data-pivot="1322 96">
          <path d="M1322 96V140" stroke="#d9c397" strokeOpacity="0.72" strokeWidth="2.5" />
          <rect x="1316" y="138" width="12" height="9" rx="2" fill="#d9c397" />
          <circle cx="1322" cy="168" r="22" fill="url(#new-year-bauble-red)" />
          <circle cx="1314" cy="159" r="6" fill="#ffe3e6" fillOpacity="0.5" />
        </g>
        <g data-new-year-bauble data-pivot="1228 132">
          <path d="M1228 132V170" stroke="#d9c397" strokeOpacity="0.72" strokeWidth="2.5" />
          <circle cx="1228" cy="192" r="16" fill="url(#new-year-bauble-red)" />
          <circle cx="1222" cy="186" r="4.5" fill="#ffe3e6" fillOpacity="0.5" />
        </g>
        <g data-new-year-bauble data-pivot="1382 62">
          <path d="M1382 62V98" stroke="#d9c397" strokeOpacity="0.72" strokeWidth="2.2" />
          <circle cx="1382" cy="114" r="13" fill="url(#new-year-bauble-red)" />
          <circle cx="1377" cy="109" r="3.6" fill="#ffe3e6" fillOpacity="0.5" />
        </g>

        {/* Snow banked along the bottom, and a candle on the sill at each side */}
        <path
          d="M0 812C168 776 322 806 486 792C690 774 852 802 1024 788C1190 774 1320 792 1440 776V900H0V812Z"
          fill="url(#new-year-drift)"
        />

        <g transform="translate(148 700)">
          <rect x="0" y="26" width="26" height="92" rx="7" fill="#f3ecdc" fillOpacity="0.86" />
          <path data-new-year-flame d="M13 30C-2 17 8 6 16 0C19 13 30 18 13 30Z" fill="#f7b23b" />
          <circle
            data-new-year-bokeh
            cx="13"
            cy="16"
            r="26"
            fill="#f7b23b"
            opacity="0.3"
            filter="url(#new-year-bokeh-blur)"
          />
        </g>
        <g transform="translate(1268 726)">
          <rect x="0" y="26" width="22" height="76" rx="6" fill="#f3ecdc" fillOpacity="0.8" />
          <path data-new-year-flame d="M11 29C-2 17 7 6 14 0C17 12 27 17 11 29Z" fill="#f7b23b" />
          <circle
            data-new-year-bokeh
            cx="11"
            cy="15"
            r="22"
            fill="#f7b23b"
            opacity="0.28"
            filter="url(#new-year-bokeh-blur)"
          />
        </g>

        <rect width="1440" height="900" fill="url(#new-year-vignette)" />
      </svg>
      <canvas ref={canvasRef} className="new-year-snow-canvas absolute inset-[0] h-full w-full" aria-hidden="true" />
    </motion.div>
  )
}
