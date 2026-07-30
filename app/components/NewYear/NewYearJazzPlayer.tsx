"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useSiteTheme } from "@/hooks/useSiteTheme"
import { useScopedI18n } from "@/locales/client"

/* Drop the track in at this path and the record picks it up. Audio extensions are already excluded
   from the locale middleware, so it is served straight from public/ */
const JAZZ_TRACK_SRC = "/new-year-jazz.mp3"

/* Bars drawn across the sleeve. Few enough to read as a level meter rather than a spectrogram */
const BAR_COUNT = 28
const FFT_SIZE = 128

export function NewYearJazzPlayer() {
  const theme = useSiteTheme()
  const reduceMotion = useReducedMotion()
  const t = useScopedI18n("common")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const discRef = useRef<SVGGElement>(null)
  const armRef = useRef<SVGGElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  /* The graph is built on the first click, because a context created before a user gesture starts
     suspended and browsers keep it that way */
  const connectAnalyser = useCallback(() => {
    const audio = audioRef.current
    if (!audio || analyserRef.current) return

    const AudioContextConstructor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) return

    try {
      const audioContext = new AudioContextConstructor()
      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = FFT_SIZE
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      audioContextRef.current = audioContext
      analyserRef.current = analyser
    } catch {
      /* No analyser is not fatal: the meter falls back to a resting idle wave */
      analyserRef.current = null
    }
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    connectAnalyser()
    await audioContextRef.current?.resume().catch(() => undefined)

    try {
      await audio.play()
      setIsPlaying(true)
      setIsUnavailable(false)
    } catch {
      /* Most often the track has not been added yet */
      setIsPlaying(false)
      setIsUnavailable(true)
    }
  }, [connectAnalyser, isPlaying])

  /* The meter. While playing it reads the analyser; at rest it breathes a low idle wave so the
     control still looks alive without burning frames on silence */
  useEffect(() => {
    if (theme !== "new-year") return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let animationFrame = 0
    const levels = new Uint8Array(FFT_SIZE / 2)

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
      const analyser = analyserRef.current
      if (isPlaying && analyser) analyser.getByteFrequencyData(levels)

      const barWidth = width / BAR_COUNT
      for (let index = 0; index < BAR_COUNT; index += 1) {
        const sampled = isPlaying && analyser ? levels[Math.floor((index / BAR_COUNT) * levels.length)] / 255 : 0
        const idle = 0.12 + Math.sin(time * 0.0015 + index * 0.5) * 0.06
        const level = Math.max(idle, sampled)
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

  /* The disc turns only while the track runs, and the arm swings onto the record with it */
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

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(() => undefined)
    }
  }, [])

  if (theme !== "new-year") return null

  return (
    <div className="new-year-jazz-player">
      <button
        type="button"
        className="new-year-jazz-control"
        aria-label={isPlaying ? t("pauseJazz") : t("playJazz")}
        aria-pressed={isPlaying}
        onClick={toggle}>
        <svg aria-hidden="true" viewBox="0 0 200 160" className="new-year-jazz-art">
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
        </svg>

        {/* The level meter sits in the sleeve's lower band */}
        <canvas ref={canvasRef} className="new-year-jazz-meter" aria-hidden="true" />

        <span
          className={`new-year-jazz-state ${isUnavailable ? "new-year-jazz-state-missing" : ""}`}
          aria-hidden="true">
          {isUnavailable ? "—" : isPlaying ? "❙❙" : "▶"}
        </span>
      </button>

      <audio ref={audioRef} src={JAZZ_TRACK_SRC} loop preload="none" onEnded={() => setIsPlaying(false)} />
    </div>
  )
}
