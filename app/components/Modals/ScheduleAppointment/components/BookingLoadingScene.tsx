"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { HalloweenBookingLoadingScene } from "@/components/Halloween/HalloweenBookingLoadingScene"
import { NewYearBookingLoadingScene } from "@/components/NewYear/NewYearBookingLoadingScene"
import { useSiteTheme } from "@/hooks/useSiteTheme"
import { useScopedI18n } from "@/locales/client"

const TAU = Math.PI * 2

function seededFraction(value: number) {
  const result = Math.sin(value * 12.9898) * 43758.5453
  return result - Math.floor(result)
}

function Gear({
  x,
  y,
  radius,
  teeth,
  direction,
}: {
  x: number
  y: number
  radius: number
  teeth: number
  direction: "clockwise" | "counter-clockwise" | "slow-clockwise"
}) {
  const toothWidth = Math.max(8, radius * 0.2)
  const toothHeight = Math.max(12, radius * 0.25)

  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="appointment-loading-gear" data-loading-gear={direction}>
        {Array.from({ length: teeth }, (_, index) => (
          <rect
            key={index}
            x={-toothWidth / 2}
            y={-radius - toothHeight * 0.72}
            width={toothWidth}
            height={toothHeight}
            rx="2"
            transform={`rotate(${(360 / teeth) * index})`}
          />
        ))}
        <circle r={radius} />
        <circle className="appointment-loading-gear-rim" r={radius * 0.72} />
        {Array.from({ length: 6 }, (_, index) => (
          <rect
            key={index}
            className="appointment-loading-gear-spoke"
            x={-radius * 0.08}
            y={-radius * 0.66}
            width={radius * 0.16}
            height={radius * 0.58}
            rx={radius * 0.06}
            transform={`rotate(${index * 60})`}
          />
        ))}
        <circle className="appointment-loading-gear-hub" r={radius * 0.2} />
        <circle className="appointment-loading-gear-hole" r={radius * 0.09} />
      </g>
    </g>
  )
}

function CrazyMechanicsBookingLoadingScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blueprintFloatRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const t = useScopedI18n("appointment.modal")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let devicePixelRatio = 1
    let animationFrame = 0
    const startedAt = performance.now()

    const motes = Array.from({ length: 30 }, (_, index) => ({
      x: seededFraction(index + 1),
      y: seededFraction(index + 37),
      radius: 0.35 + seededFraction(index + 73) * 1.45,
      speed: 2.5 + seededFraction(index + 101) * 7,
      phase: seededFraction(index + 149) * TAU,
    }))

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(bounds.width))
      height = Math.max(1, Math.round(bounds.height))
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      const pixelWidth = Math.round(width * devicePixelRatio)
      const pixelHeight = Math.round(height * devicePixelRatio)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
    }

    const draw = (timestamp: number) => {
      if (!width || !height) resize()

      const elapsed = timestamp - startedAt
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = "#050404"
      context.fillRect(0, 0, width, height)

      const brickWidth = Math.max(64, Math.min(112, width / 6))
      const brickHeight = brickWidth * 0.34
      const rowCount = Math.ceil(height / brickHeight) + 2
      const columnCount = Math.ceil(width / brickWidth) + 3

      for (let row = -1; row < rowCount; row += 1) {
        const offset = row % 2 === 0 ? -brickWidth * 0.5 : 0

        for (let column = -1; column < columnCount; column += 1) {
          const x = column * brickWidth + offset
          const y = row * brickHeight
          const variation = seededFraction(row * 43 + column * 17 + 91)
          const red = 38 + Math.round(variation * 24)
          const green = 20 + Math.round(variation * 12)
          const blue = 17 + Math.round(variation * 8)

          context.fillStyle = `rgb(${red} ${green} ${blue})`
          context.fillRect(x + 2, y + 2, brickWidth - 4, brickHeight - 4)
          context.fillStyle = `rgb(255 224 195 / ${0.025 + variation * 0.035})`
          context.fillRect(x + 4, y + 3, brickWidth - 8, 1)
          context.strokeStyle = "rgb(7 5 5 / 0.82)"
          context.lineWidth = 2
          context.strokeRect(x + 1, y + 1, brickWidth - 2, brickHeight - 2)
        }
      }

      const warmLight = context.createRadialGradient(
        width * 0.5,
        height * 0.34,
        0,
        width * 0.5,
        height * 0.34,
        Math.max(width, height) * 0.72,
      )
      warmLight.addColorStop(0, "rgb(111 67 40 / 0.2)")
      warmLight.addColorStop(0.48, "rgb(18 12 11 / 0.32)")
      warmLight.addColorStop(1, "rgb(0 0 0 / 0.9)")
      context.fillStyle = warmLight
      context.fillRect(0, 0, width, height)

      context.save()
      context.globalCompositeOperation = "screen"
      for (const mote of motes) {
        const x = ((mote.x * width + (elapsed / 1000) * mote.speed) % (width + 20)) - 10
        const y = mote.y * height + Math.sin(elapsed * 0.00055 + mote.phase) * 10
        context.beginPath()
        context.arc(x, y, mote.radius, 0, TAU)
        context.fillStyle = `rgb(226 177 104 / ${0.08 + mote.radius * 0.045})`
        context.fill()
      }

      if (!reduceMotion) {
        for (let index = 0; index < 7; index += 1) {
          const progress = (elapsed * 0.00042 + seededFraction(index + 211)) % 1
          if (progress > 0.16) continue

          const sparkX = width * (0.43 + seededFraction(index + 251) * 0.17)
          const sparkY = height * (0.72 + progress * 0.15)
          context.beginPath()
          context.moveTo(sparkX, sparkY)
          context.lineTo(sparkX + 4 + index, sparkY + 8 + progress * 22)
          context.strokeStyle = `rgb(255 178 72 / ${1 - progress / 0.16})`
          context.lineWidth = 1.2
          context.stroke()
        }
      }
      context.restore()

      const edgeShade = context.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.18,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.68,
      )
      edgeShade.addColorStop(0, "rgb(0 0 0 / 0)")
      edgeShade.addColorStop(0.7, "rgb(0 0 0 / 0.38)")
      edgeShade.addColorStop(1, "rgb(0 0 0 / 0.92)")
      context.fillStyle = edgeShade
      context.fillRect(0, 0, width, height)

      if (!reduceMotion) animationFrame = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw(performance.now())
    })

    resizeObserver.observe(canvas)
    resize()
    draw(performance.now())

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [reduceMotion])

  useLayoutEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const animationContext = gsap.context(() => {
      gsap.set("[data-loading-gear]", {
        svgOrigin: "0 0",
        transformBox: "fill-box",
        transformOrigin: "50% 50%",
      })

      if (reduceMotion) return

      gsap.to('[data-loading-gear="clockwise"]', {
        rotation: 360,
        duration: 3.8,
        ease: "none",
        repeat: -1,
      })
      gsap.to('[data-loading-gear="counter-clockwise"]', {
        rotation: -360,
        duration: 2.65,
        ease: "none",
        repeat: -1,
      })
      gsap.to('[data-loading-gear="slow-clockwise"]', {
        rotation: 360,
        duration: 4.9,
        ease: "none",
        repeat: -1,
      })
      gsap.fromTo(
        blueprintFloatRef.current,
        { rotation: -1.1, y: 3 },
        {
          rotation: 1.1,
          y: -3,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        },
      )
      gsap.fromTo(
        "[data-loading-scan]",
        { y: -138, opacity: 0 },
        {
          y: 146,
          opacity: 0.42,
          duration: 2.6,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 0.35,
        },
      )
      gsap.to("[data-loading-warning]", {
        opacity: 0.34,
        scale: 0.88,
        duration: 0.52,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 50%",
      })
      gsap.to("[data-loading-needle]", {
        rotation: 52,
        duration: 0.8,
        ease: "back.inOut(2)",
        repeat: -1,
        repeatDelay: 0.28,
        yoyo: true,
        transformBox: "fill-box",
        transformOrigin: "0% 50%",
      })
    }, scene)

    return () => animationContext.revert()
  }, [reduceMotion])

  return (
    <motion.div
      ref={sceneRef}
      role="status"
      aria-live="polite"
      className="appointment-loading-screen absolute inset-[0] z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28 }}>
      <canvas ref={canvasRef} className="absolute inset-[0] h-full w-full" aria-hidden="true" />

      <div className="relative z-10 flex h-full min-h-[520px] w-full flex-col items-center justify-center gap-sm px-sm py-[2.75rem] tablet:min-h-[590px] tablet:gap-md tablet:px-lg">
        <motion.div
          className="w-[92%] max-w-[540px]"
          initial={{ opacity: 0, scale: 0.76, y: -28, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.2, 0.88, 0.28, 1.18] }}>
          <div ref={blueprintFloatRef} className="appointment-loading-blueprint relative aspect-[5/3] w-full">
            <svg
              aria-hidden="true"
              className="absolute inset-[0] h-full w-full"
              viewBox="0 0 600 360"
              preserveAspectRatio="none">
              <defs>
                <linearGradient id="appointment-blueprint-paper" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#718493" />
                  <stop offset="0.52" stopColor="#536777" />
                  <stop offset="1" stopColor="#3d5262" />
                </linearGradient>
                <pattern id="appointment-blueprint-grid-small" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M16 0H0V16" fill="none" stroke="rgb(231 243 246 / 0.13)" strokeWidth="0.8" />
                </pattern>
                <pattern id="appointment-blueprint-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect width="80" height="80" fill="url(#appointment-blueprint-grid-small)" />
                  <path d="M80 0H0V80" fill="none" stroke="rgb(231 243 246 / 0.2)" strokeWidth="1.2" />
                </pattern>
                <clipPath id="appointment-blueprint-clip">
                  <path d="M31 18L146 11l10 8 124-7 12 11 132-10 9 10 133-5 13 58-9 103 8 76-18 78-132 7-10-9-126 12-12-9-136 10-8-10-110 7-12-56 8-104-9-99Z" />
                </clipPath>
                <filter id="appointment-blueprint-shadow" x="-20%" y="-20%" width="140%" height="150%">
                  <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.72" />
                </filter>
              </defs>

              <g filter="url(#appointment-blueprint-shadow)">
                <path
                  d="M31 18L146 11l10 8 124-7 12 11 132-10 9 10 133-5 13 58-9 103 8 76-18 78-132 7-10-9-126 12-12-9-136 10-8-10-110 7-12-56 8-104-9-99Z"
                  fill="url(#appointment-blueprint-paper)"
                  stroke="#263947"
                  strokeWidth="5"
                />
                <g clipPath="url(#appointment-blueprint-clip)">
                  <rect width="600" height="360" fill="url(#appointment-blueprint-grid)" />
                  <g fill="none" stroke="rgb(235 244 247 / 0.34)" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="210" cy="132" r="50" strokeWidth="4" />
                    <circle cx="210" cy="132" r="19" strokeWidth="3" />
                    <circle cx="406" cy="132" r="33" strokeWidth="3" />
                    <path d="M211 82 405 99M211 182l194-17M197 178l-54 89h225l38-102" strokeWidth="5" />
                    <path d="M144 267h288m-256-20 35-65m157 65 37-82M210 132l-42 25m42-25 23 44" strokeWidth="3" />
                    <path d="m391 108 30 24-31 22-25-24Z" strokeWidth="3" />
                    <path d="M104 94h70M104 106h46M440 235h71M458 247h53" strokeWidth="2" />
                    <path d="M84 301c45-18 87-8 123 8m184-15c38-10 76-4 111 10" strokeWidth="2" />
                    <circle cx="144" cy="267" r="8" strokeWidth="3" />
                    <circle cx="368" cy="267" r="8" strokeWidth="3" />
                  </g>
                  <g fill="rgb(239 247 249 / 0.38)" fontFamily="monospace" fontSize="13">
                    <text x="55" y="63">
                      03 / 14
                    </text>
                    <text x="424" y="63">
                      1 : 4
                    </text>
                    <text x="58" y="318">
                      {"F = m · a"}
                    </text>
                    <text x="456" y="316">
                      {"R.14"}
                    </text>
                  </g>
                  <rect data-loading-scan x="28" y="170" width="545" height="3" fill="rgb(210 238 246 / 0.55)" />
                </g>
              </g>

              <g data-loading-warning transform="translate(287 202)">
                <circle r="24" fill="#d7a728" stroke="#1d2428" strokeWidth="5" />
                <path d="m0-14 14 25h-28Z" fill="#20262a" />
                <path d="M0-7v10m0 5v1" stroke="#d7a728" strokeLinecap="round" strokeWidth="3" />
              </g>
              <g transform="translate(500 205)">
                <circle r="24" fill="#d8dde0" stroke="#26343d" strokeWidth="5" />
                <circle r="5" fill="#26343d" />
                <path data-loading-needle d="M0 0h15" stroke="#b43c31" strokeLinecap="round" strokeWidth="3" />
              </g>
            </svg>

            <div className="absolute inset-x-[5%] top-[45%] -translate-y-1/2 text-center">
              <motion.h2
                className="appointment-loading-title"
                initial={{ opacity: 0, scaleX: 0.72 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.28, duration: reduceMotion ? 0 : 0.48 }}>
                {t("loadingTitle")}
              </motion.h2>
              <motion.p
                className="appointment-loading-subtitle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.46, duration: reduceMotion ? 0 : 0.38 }}>
                {t("loadingSubtitle")}
              </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-[70%] max-w-[390px]"
          initial={{ opacity: 0, y: 24, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.35, duration: reduceMotion ? 0 : 0.55 }}>
          <svg aria-hidden="true" className="h-auto w-full overflow-visible" viewBox="0 0 500 220">
            <defs>
              <filter id="appointment-gear-shadow" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#000" floodOpacity="0.72" />
              </filter>
              <linearGradient id="appointment-gear-metal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e2e5e6" />
                <stop offset="0.45" stopColor="#90989d" />
                <stop offset="1" stopColor="#565e63" />
              </linearGradient>
            </defs>
            <g
              filter="url(#appointment-gear-shadow)"
              fill="url(#appointment-gear-metal)"
              stroke="#252b2f"
              strokeWidth="4">
              <Gear x={112} y={112} radius={43} teeth={12} direction="counter-clockwise" />
              <Gear x={252} y={105} radius={72} teeth={16} direction="clockwise" />
              <Gear x={403} y={115} radius={45} teeth={12} direction="slow-clockwise" />
            </g>
          </svg>
        </motion.div>

        <motion.p
          className="font-typewriter text-xs uppercase tracking-[0.18em] text-secondary-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.38, 0.92, 0.38] }}
          transition={{ duration: reduceMotion ? 0 : 1.4, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}>
          {t("booking")}
        </motion.p>
      </div>
    </motion.div>
  )
}

export function BookingLoadingScene() {
  const theme = useSiteTheme()

  if (theme === "halloween") return <HalloweenBookingLoadingScene />
  if (theme === "new-year") return <NewYearBookingLoadingScene />

  return <CrazyMechanicsBookingLoadingScene />
}
