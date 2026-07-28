"use client"

import { useEffect, useLayoutEffect, useRef } from "react"

import { motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useScopedI18n } from "@/locales/client"

const FULL_CIRCLE = Math.PI * 2

interface SpiritMote {
  x: number
  y: number
  radius: number
  drift: number
  phase: number
  tone: "green" | "purple" | "orange"
}

function getMoteColor(tone: SpiritMote["tone"]) {
  if (tone === "green") return "126, 196, 123"
  if (tone === "orange") return "255, 120, 25"
  return "171, 132, 205"
}

export function HalloweenBookingLoadingScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
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
    let pixelRatio = 1
    let animationFrame = 0
    const startedAt = performance.now()
    const motes: SpiritMote[] = Array.from({ length: 34 }, (_, index) => ({
      x: (index * 0.287 + 0.07) % 1,
      y: (index * 0.173 + 0.11) % 1,
      radius: 0.7 + (index % 4) * 0.38,
      drift: 0.008 + (index % 5) * 0.003,
      phase: index * 1.17,
      tone: index % 8 === 0 ? "orange" : index % 3 === 0 ? "green" : "purple",
    }))

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(bounds.width))
      height = Math.max(1, Math.round(bounds.height))
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
    }

    const draw = (timestamp: number) => {
      const elapsed = timestamp - startedAt
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)

      const sky = context.createLinearGradient(0, 0, 0, height)
      sky.addColorStop(0, "#100918")
      sky.addColorStop(0.62, "#070509")
      sky.addColorStop(1, "#020203")
      context.fillStyle = sky
      context.fillRect(0, 0, width, height)

      const ritualGlow = context.createRadialGradient(
        width * 0.5,
        height * 0.58,
        0,
        width * 0.5,
        height * 0.58,
        Math.max(width, height) * 0.58,
      )
      ritualGlow.addColorStop(0, "rgb(103 72 137 / 0.26)")
      ritualGlow.addColorStop(0.42, "rgb(54 86 56 / 0.1)")
      ritualGlow.addColorStop(1, "rgb(0 0 0 / 0)")
      context.fillStyle = ritualGlow
      context.fillRect(0, 0, width, height)

      motes.forEach(mote => {
        const motionOffset = reduceMotion ? 0 : elapsed * 0.00001 * mote.drift * height
        const y = ((mote.y - motionOffset + 1) % 1) * height
        const x = (mote.x + Math.sin(elapsed * 0.00042 + mote.phase) * 0.025) * width
        const pulse = reduceMotion ? 0.35 : 0.25 + Math.sin(elapsed * 0.0018 + mote.phase) * 0.16
        const color = getMoteColor(mote.tone)

        context.beginPath()
        context.arc(x, y, mote.radius, 0, FULL_CIRCLE)
        context.fillStyle = `rgb(${color} / ${Math.max(0.08, pulse)})`
        context.fill()
      })

      for (let index = 0; index < 4; index += 1) {
        const phase = elapsed * (0.00008 + index * 0.000012) + index * 1.8
        const centerX = width * (0.16 + index * 0.23) + Math.sin(phase) * width * 0.08
        const centerY = height * (0.72 + Math.sin(phase * 0.7) * 0.045)
        const radius = width * (0.16 + index * 0.018)
        const fog = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        fog.addColorStop(0, index % 2 === 0 ? "rgb(105 151 106 / 0.055)" : "rgb(137 103 165 / 0.06)")
        fog.addColorStop(1, "rgb(0 0 0 / 0)")
        context.fillStyle = fog
        context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2)
      }

      const vignette = context.createRadialGradient(
        width * 0.5,
        height * 0.46,
        Math.min(width, height) * 0.16,
        width * 0.5,
        height * 0.46,
        Math.max(width, height) * 0.7,
      )
      vignette.addColorStop(0, "rgb(0 0 0 / 0)")
      vignette.addColorStop(0.7, "rgb(0 0 0 / 0.28)")
      vignette.addColorStop(1, "rgb(0 0 0 / 0.9)")
      context.fillStyle = vignette
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
      gsap.set("[data-halloween-loading-ring]", {
        transformBox: "fill-box",
        transformOrigin: "50% 50%",
      })

      if (reduceMotion) return

      gsap.to('[data-halloween-loading-ring="outer"]', {
        rotation: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
      })
      gsap.to('[data-halloween-loading-ring="inner"]', {
        rotation: -360,
        duration: 12,
        ease: "none",
        repeat: -1,
      })
      gsap.to("[data-halloween-loading-rune]", {
        opacity: 0.28,
        scale: 0.82,
        duration: 0.8,
        ease: "sine.inOut",
        repeat: -1,
        stagger: {
          amount: 1.2,
          from: "random",
        },
        yoyo: true,
        transformBox: "fill-box",
        transformOrigin: "50% 50%",
      })
      gsap.to("[data-halloween-loading-flame]", {
        opacity: 0.58,
        scaleX: 0.78,
        scaleY: 1.24,
        duration: 0.18,
        ease: "sine.inOut",
        repeat: -1,
        stagger: 0.07,
        transformBox: "fill-box",
        transformOrigin: "50% 100%",
        yoyo: true,
      })
      gsap.to("[data-halloween-loading-spirit]", {
        y: -9,
        rotation: 2.4,
        duration: 2.3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformBox: "fill-box",
        transformOrigin: "50% 50%",
      })
      gsap.to("[data-halloween-loading-eyes]", {
        opacity: 0.42,
        duration: 1.1,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
    }, scene)

    return () => animationContext.revert()
  }, [reduceMotion])

  return (
    <motion.div
      ref={sceneRef}
      role="status"
      aria-live="polite"
      className="appointment-loading-screen halloween-booking-loading-screen absolute inset-[0] z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}>
      <canvas ref={canvasRef} className="absolute inset-[0] h-full w-full" aria-hidden="true" />

      <svg
        aria-hidden="true"
        className="halloween-booking-webs absolute inset-[0] h-full w-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="none">
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M0 0 174 0M0 0v172M0 0l180 176M52 0c0 55 27 94 81 119M0 52c54 0 95 27 119 81" />
          <path d="M800 0H626M800 0v172M800 0 620 176M748 0c0 55-27 94-81 119M800 52c-54 0-95 27-119 81" />
          <path d="M0 800h174M0 800V628M0 800l180-176M52 800c0-55 27-94 81-119M0 748c54 0 95-27 119-81" />
          <path d="M800 800H626M800 800V628M800 800 620 624M748 800c0-55-27-94-81-119M800 748c-54 0-95-27-119-81" />
        </g>
      </svg>

      <div className="relative z-10 flex h-full min-h-[520px] w-full flex-col items-center justify-center px-sm py-lg tablet:min-h-[590px] tablet:px-lg">
        <motion.div
          className="halloween-booking-tablet relative w-[92%] max-w-[560px]"
          initial={{ opacity: 0, scale: 0.76, y: -22, rotate: -2.5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.68, ease: [0.2, 0.88, 0.28, 1.12] }}>
          <svg aria-hidden="true" className="h-auto w-full overflow-visible" viewBox="0 0 620 410">
            <defs>
              <filter id="halloween-loading-shadow" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="15" stdDeviation="13" floodColor="#000" floodOpacity="0.82" />
              </filter>
              <radialGradient id="halloween-loading-stone" cx="50%" cy="10%" r="90%">
                <stop offset="0" stopColor="#4a3a5b" />
                <stop offset="0.52" stopColor="#21172b" />
                <stop offset="1" stopColor="#09070c" />
              </radialGradient>
              <linearGradient id="halloween-loading-vine" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#76906e" />
                <stop offset="1" stopColor="#294231" />
              </linearGradient>
            </defs>

            <path
              d="M45 78 92 29l92 6 35-20 93 19 73-18 52 26 99-4 41 48-14 257-57 37-108-8-45 19-80-17-68 21-68-24-90 8-43-43Z"
              fill="url(#halloween-loading-stone)"
              stroke="#77658a"
              strokeWidth="7"
              filter="url(#halloween-loading-shadow)"
            />
            <path
              d="M54 89c43-25 80-23 113-11-28-38 15-58 43-21 12-48 59-45 70-5 29-40 71-22 63 23 41-25 78-4 68 35 48-14 84 18 58 52M51 329c42 21 79 22 114 7-18 37 26 53 51 20 17 42 57 42 73 3 25 34 64 19 59-22 37 21 69 2 63-31 42 12 69-14 50-46"
              fill="none"
              stroke="url(#halloween-loading-vine)"
              strokeLinecap="round"
              strokeWidth="12"
            />
            <g data-halloween-loading-spirit transform="translate(250 62)">
              <path
                d="M60 2c37 0 58 28 58 66v64l-29-17-29 18-28-18-30 17V68C2 30 23 2 60 2Z"
                fill="#ddd6e1"
                stroke="#5d4c6b"
                strokeWidth="7"
              />
              <g data-halloween-loading-eyes fill="#0a070d">
                <ellipse cx="39" cy="62" rx="11" ry="15" />
                <ellipse cx="80" cy="62" rx="11" ry="15" />
              </g>
              <path d="M48 89c8 7 16 7 24 0" fill="none" stroke="#0a070d" strokeLinecap="round" strokeWidth="6" />
            </g>
            <path
              d="M85 161 46 137M83 168l-45 8M535 161l39-24M537 168l45 8"
              stroke="#8d789e"
              strokeLinecap="round"
              strokeWidth="5"
            />
            <g transform="translate(75 312)">
              <path d="M0 34h44L35 0H9Z" fill="#ded7cb" stroke="#44364e" strokeWidth="5" />
              <path
                data-halloween-loading-flame
                d="M22 2C7-11 13-29 25-38c-2 14 16 20 8 39Z"
                fill="#ff861f"
                stroke="#ffc15e"
                strokeWidth="3"
              />
            </g>
            <g transform="translate(501 312)">
              <path d="M0 34h44L35 0H9Z" fill="#ded7cb" stroke="#44364e" strokeWidth="5" />
              <path
                data-halloween-loading-flame
                d="M22 2C7-11 13-29 25-38c-2 14 16 20 8 39Z"
                fill="#ff861f"
                stroke="#ffc15e"
                strokeWidth="3"
              />
            </g>
          </svg>

          <div className="absolute inset-x-[12%] top-[58%] -translate-y-1/2 text-center">
            <motion.h2
              className="halloween-booking-loading-title"
              initial={{ opacity: 0, scale: 0.76 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.25, duration: reduceMotion ? 0 : 0.5 }}>
              {t("halloweenLoadingTitle")}
            </motion.h2>
            <motion.p
              className="halloween-booking-loading-subtitle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.42, duration: reduceMotion ? 0 : 0.38 }}>
              {t("halloweenLoadingSubtitle")}
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="halloween-booking-ritual relative -mt-lg h-[180px] w-[min(78vw,390px)]"
          initial={{ opacity: 0, scale: 0.7, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.34, duration: reduceMotion ? 0 : 0.58 }}>
          <svg aria-hidden="true" className="h-full w-full overflow-visible" viewBox="0 0 460 210">
            <g data-halloween-loading-ring="outer" fill="none" stroke="#75618a" strokeLinecap="round" strokeWidth="3">
              <circle cx="230" cy="105" r="84" strokeDasharray="3 9" />
              <path d="m230 8 14 25-28 0ZM327 105l-25 14v-28ZM230 202l-14-25h28ZM133 105l25-14v28Z" />
            </g>
            <g data-halloween-loading-ring="inner" fill="none" stroke="#4e754e" strokeLinecap="round" strokeWidth="4">
              <circle cx="230" cy="105" r="57" strokeDasharray="18 8" />
              <path d="m230 48 49 86h-98Z" />
            </g>
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (index / 8) * FULL_CIRCLE
              const x = 230 + Math.cos(angle) * 107
              const y = 105 + Math.sin(angle) * 83
              return (
                <circle
                  key={index}
                  data-halloween-loading-rune
                  cx={x}
                  cy={y}
                  r="7"
                  fill={index % 3 === 0 ? "#ff7819" : "#8a73a0"}
                />
              )
            })}
            <g transform="translate(197 72)">
              <path
                d="M33 1C52 1 65 15 65 34c0 13-7 23-17 28v14H18V62C7 57 1 47 1 34 1 15 14 1 33 1Z"
                fill="#dcd5df"
                stroke="#5d4b69"
                strokeWidth="5"
              />
              <ellipse cx="22" cy="34" rx="7" ry="9" fill="#09070c" />
              <ellipse cx="44" cy="34" rx="7" ry="9" fill="#09070c" />
              <path d="m33 43-6 10h12Z" fill="#09070c" />
              <path d="M21 62v14m8-15v15m8-15v15m8-14v14" stroke="#09070c" strokeWidth="3" />
            </g>
          </svg>
        </motion.div>

        <motion.p
          className="halloween-booking-status -mt-sm font-typewriter text-xs uppercase tracking-[0.18em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduceMotion ? 0.88 : [0.42, 1, 0.42] }}
          transition={{ duration: reduceMotion ? 0 : 1.5, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}>
          {t("booking")}
        </motion.p>
      </div>
    </motion.div>
  )
}
