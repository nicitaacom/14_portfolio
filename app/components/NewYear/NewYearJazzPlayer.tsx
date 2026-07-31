"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useSiteTheme } from "@/hooks/useSiteTheme"
import { useScopedI18n } from "@/locales/client"

/* The lo-fi christmas playlist this plays, on the privacy-preserving host.
   The embed stays visible at 200x200 or larger: YouTube's terms do not allow the player to be
   hidden or the audio to be separated from the video, so the record reveals a real player rather
   than streaming the sound out of a frame nobody can see. */
const JAZZ_VIDEO_ID = "Sw95YCoxwjQ"
const JAZZ_PLAYLIST_ID = "PLhaOvy5XSZ0OGsCALneUyAd0ti5mOtJLQ"
const JAZZ_EMBED_SRC =
  `https://www.youtube-nocookie.com/embed/${JAZZ_VIDEO_ID}` +
  `?list=${JAZZ_PLAYLIST_ID}&autoplay=1&rel=0&modestbranding=1`

/* Bars drawn across the sleeve. Few enough to read as a level meter rather than a spectrogram */
const BAR_COUNT = 28

export function NewYearJazzPlayer() {
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()
  const t = useScopedI18n("common")
  const [isPlaying, setIsPlaying] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const discRef = useRef<SVGGElement>(null)
  const armRef = useRef<SVGGElement>(null)

  const toggle = useCallback(() => setIsPlaying(playing => !playing), [])

  /* The meter. The track plays inside a cross-origin frame, so its samples are not readable from
     here and there is no analyser to attach — these bars are a synthetic level, moving while the
     player is open and settling to a low idle wave when it is closed. */
  useEffect(() => {
    if (theme !== "new-year") return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let animationFrame = 0

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const drawMeter = (time: number) => {
      context.clearRect(0, 0, width, height)
      const barWidth = width / BAR_COUNT

      for (let index = 0; index < BAR_COUNT; index += 1) {
        /* Three sine terms of different periods so the row never marches in step */
        const swing =
          Math.sin(time * 0.006 + index * 0.7) * 0.3 +
          Math.sin(time * 0.011 + index * 1.9) * 0.22 +
          Math.sin(time * 0.003 + index * 0.31) * 0.18
        const idle = 0.12 + Math.sin(time * 0.0015 + index * 0.5) * 0.06
        const level = isPlaying ? Math.min(1, 0.32 + Math.abs(swing)) : idle
        const barHeight = Math.max(2, level * height)

        context.fillStyle =
          index % 4 === 0 ? `rgba(247, 178, 59, ${0.5 + level * 0.5})` : `rgba(255, 253, 250, ${0.32 + level * 0.55})`
        context.fillRect(index * barWidth + barWidth * 0.22, height - barHeight, barWidth * 0.56, barHeight)
      }

      animationFrame = requestAnimationFrame(drawMeter)
    }

    resizeCanvas()
    if (reduceMotion) drawMeter(0)
    else animationFrame = requestAnimationFrame(drawMeter)

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [isPlaying, reduceMotion, theme])

  /* The disc turns only while the player is open, and the arm swings onto the record with it */
  useEffect(() => {
    const disc = discRef.current
    const arm = armRef.current
    if (theme !== "new-year" || !disc || !arm) return

    const animationContext = gsap.context(() => {
      gsap.to(arm, {
        rotation: isPlaying ? -16 : 0,
        svgOrigin: "150 40",
        duration: reduceMotion ? 0 : 0.6,
        ease: "power2.out",
      })

      if (reduceMotion || !isPlaying) return

      gsap.to(disc, {
        rotation: 360,
        svgOrigin: "78 78",
        duration: 3.4,
        ease: "none",
        repeat: -1,
      })
    })

    return () => animationContext.revert()
  }, [isPlaying, reduceMotion, theme])

  if (theme !== "new-year") return null

  const sizeTransition = { duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="new-year-jazz-player">
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="jazz-frame"
            className="new-year-jazz-frame"
            initial={{ clipPath: "inset(0 0 0 100%)" }}
            animate={{ clipPath: "inset(0 0 0 0%)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={sizeTransition}>
            <iframe
              src={JAZZ_EMBED_SRC}
              title={t("playJazz")}
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/UI/new-year/lofi-new-year-girl.png" alt="" className="new-year-jazz-listener" aria-hidden="true" />
      )}

      <motion.button
        layout
        transition={sizeTransition}
        type="button"
        className={`new-year-jazz-control${isPlaying ? " new-year-jazz-control-open" : ""}`}
        aria-label={isPlaying ? t("pauseJazz") : t("playJazz")}
        aria-pressed={isPlaying}
        onClick={toggle}>
        <motion.svg layout transition={sizeTransition} aria-hidden="true" viewBox="0 0 200 160" className="new-year-jazz-art">
          {/* Sleeve */}
          <path d="M6 16H150C160 16 166 22 166 32V144C166 152 160 156 152 156H14C8 156 6 150 6 144Z" fill="#123d2c" />
          <path d="M6 16H150C160 16 166 22 166 32V44H6Z" fill="#0b2a1e" />

          {/* Record */}
          <g ref={discRef}>
            <circle cx="78" cy="78" r="52" fill="#14100f" />
            <circle cx="78" cy="78" r="52" fill="none" stroke="#2a2422" strokeWidth="1.5" />
            <circle cx="78" cy="78" r="42" fill="none" stroke="#2a2422" strokeWidth="1.2" />
            <circle cx="78" cy="78" r="32" fill="none" stroke="#2a2422" strokeWidth="1.2" />
            <circle cx="78" cy="78" r="18" fill="#c81a30" />
            <circle cx="78" cy="78" r="4" fill="#fdfbf6" />
            {/* One bright groove so the spin is legible */}
            <path d="M78 26A52 52 0 0 1 130 78" stroke="#5e5450" strokeWidth="2" fill="none" />
          </g>

          {/* Tone arm, pivoting at its rest post */}
          <g ref={armRef}>
            <path d="M150 40L92 96" stroke="#d9c397" strokeWidth="5" strokeLinecap="round" />
            <circle cx="150" cy="40" r="9" fill="#d9c397" />
            <circle cx="150" cy="40" r="4" fill="#8b7a55" />
            <path d="M86 92L98 104" stroke="#fdfbf6" strokeWidth="7" strokeLinecap="round" />
          </g>

          {/* A sprig so the player belongs to the season */}
          <path d="M140 132q12-10 22-4" stroke="#1d5c40" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="158" cy="126" r="5" fill="#c81a30" />
        </motion.svg>

        {/* The level meter sits in the sleeve's lower band */}
        <canvas ref={canvasRef} className="new-year-jazz-meter" aria-hidden="true" />

        <span className="new-year-jazz-state" aria-hidden="true">
          {isPlaying ? "❙❙" : "▶"}
        </span>
      </motion.button>
    </div>
  )
}
