"use client"

import { useEffect, useRef, useState } from "react"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useSiteTheme } from "@/hooks/useSiteTheme"

type FireworksPhase = "idle" | "burst" | "fading"

const INITIAL_EVENT_DELAY = { min: 16_000, max: 28_000 }
const REPEAT_EVENT_DELAY = { min: 70_000, max: 120_000 }
const BURST_DURATION = { min: 4_500, max: 6_500 }
const BURST_FADE_MS = 900
const RETRY_DELAY = 10_000
const SHELL_INTERVAL = { min: 420, max: 980 }

/* Lifted off the surface palette: these sit against the night sky, where the 48% crimson and
   44% fir of the token block read as mud */
const SHELL_COLOURS = ["255, 90, 108", "247, 178, 59", "255, 253, 250", "126, 214, 168", "217, 195, 151"]

const GRAVITY = 0.00028
const DRAG = 0.9986

interface Rocket {
  x: number
  y: number
  previousY: number
  velocityX: number
  velocityY: number
  colour: string
  fuse: number
}

interface Spark {
  x: number
  y: number
  previousX: number
  previousY: number
  velocityX: number
  velocityY: number
  life: number
  maxLife: number
  size: number
  colour: string
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pickColour() {
  return SHELL_COLOURS[Math.floor(Math.random() * SHELL_COLOURS.length)]
}

export function NewYearFireworksEvent() {
  const [phase, setPhase] = useState<FireworksPhase>("idle")
  const theme = useSiteTheme()
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const scheduleBurstFinishRef = useRef<(() => void) | null>(null)

  /* Held true across the fade so the particles keep falling while the burst bows out, rather
     than the canvas unmounting mid-flight */
  const isBurstVisible = phase === "burst" || phase === "fading"

  useEffect(() => {
    if (theme !== "new-year" || reducedMotion) {
      setPhase("idle")
      return
    }

    let isMounted = true
    let currentPhase: FireworksPhase = "idle"
    const timers = new Set<ReturnType<typeof setTimeout>>()

    const isUnavailable = () => document.hidden || document.body.classList.contains("modal-open")
    const updatePhase = (nextPhase: FireworksPhase) => {
      currentPhase = nextPhase
      if (isMounted) setPhase(nextPhase)
    }
    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
    }
    const clearTimers = () => {
      timers.forEach(timer => clearTimeout(timer))
      timers.clear()
    }
    const scheduleNextEvent = (initial = false) => {
      const delay = initial
        ? randomBetween(INITIAL_EVENT_DELAY.min, INITIAL_EVENT_DELAY.max)
        : randomBetween(REPEAT_EVENT_DELAY.min, REPEAT_EVENT_DELAY.max)
      schedule(beginEvent, delay)
    }

    const finishEvent = () => {
      updatePhase("fading")
      schedule(() => {
        updatePhase("idle")
        scheduleNextEvent()
      }, BURST_FADE_MS)
    }

    function beginEvent() {
      if (isUnavailable()) {
        updatePhase("idle")
        schedule(beginEvent, RETRY_DELAY)
        return
      }

      updatePhase("burst")
    }

    scheduleBurstFinishRef.current = () => {
      schedule(
        () => {
          if (isUnavailable()) {
            clearTimers()
            updatePhase("idle")
            schedule(beginEvent, RETRY_DELAY)
            return
          }

          finishEvent()
        },
        randomBetween(BURST_DURATION.min, BURST_DURATION.max),
      )
    }

    const cancelWhileUnavailable = () => {
      if (isUnavailable()) {
        clearTimers()
        updatePhase("idle")
        return
      }

      if (currentPhase === "idle" && timers.size === 0) schedule(beginEvent, RETRY_DELAY)
    }

    /* Test hook: dispatching new-year:fireworks on window starts a burst at once, so the
       display does not have to be waited out */
    const triggerForPreview = () => {
      clearTimers()
      beginEvent()
    }

    scheduleNextEvent(true)
    const bodyObserver = new MutationObserver(cancelWhileUnavailable)
    bodyObserver.observe(document.body, { attributeFilter: ["class"], attributes: true })
    document.addEventListener("visibilitychange", cancelWhileUnavailable)
    window.addEventListener("new-year:fireworks", triggerForPreview)

    return () => {
      isMounted = false
      scheduleBurstFinishRef.current = null
      clearTimers()
      bodyObserver.disconnect()
      document.removeEventListener("visibilitychange", cancelWhileUnavailable)
      window.removeEventListener("new-year:fireworks", triggerForPreview)
    }
  }, [reducedMotion, theme])

  useEffect(() => {
    if (phase !== "burst") return
    scheduleBurstFinishRef.current?.()
  }, [phase])

  useEffect(() => {
    if (!isBurstVisible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let animationFrame = 0
    let lastFrameTime = performance.now()
    let nextShellAt = performance.now() + 120
    const rockets: Rocket[] = []
    const sparks: Spark[] = []
    const isLaunching = phase === "burst"
    /* The flash tweens are created one per shell, so they are recorded on a context and the
       whole set is reverted together when the burst ends */
    const flashContext = gsap.context(() => {})

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const flashAt = (x: number, y: number) => {
      const flash = flashRef.current
      if (!flash) return

      flash.style.setProperty("--flash-x", `${x}px`)
      flash.style.setProperty("--flash-y", `${y}px`)
      flashContext.add(() => {
        gsap.fromTo(flash, { opacity: 0.2 }, { opacity: 0, duration: 0.5, ease: "power2.out", overwrite: true })
      })
    }

    const explode = (rocket: Rocket) => {
      const sparkCount = 58 + Math.floor(Math.random() * 34)
      const power = 0.13 + Math.random() * 0.08

      for (let index = 0; index < sparkCount; index += 1) {
        const angle = (index / sparkCount) * Math.PI * 2 + Math.random() * 0.14
        /* Square-rooting a uniform sample spreads the sparks evenly over the disc instead of
           bunching them at the rim, which is what a real shell looks like */
        const speed = power * Math.sqrt(Math.random()) * (0.55 + Math.random() * 0.65)
        const maxLife = randomBetween(900, 1700)

        sparks.push({
          x: rocket.x,
          y: rocket.y,
          previousX: rocket.x,
          previousY: rocket.y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: 0.9 + Math.random() * 1.5,
          colour: Math.random() < 0.18 ? pickColour() : rocket.colour,
        })
      }

      flashAt(rocket.x, rocket.y)
    }

    const launchShell = () => {
      const x = randomBetween(width * 0.12, width * 0.88)
      rockets.push({
        x,
        y: height + 8,
        previousY: height + 8,
        velocityX: randomBetween(-0.03, 0.03),
        velocityY: -randomBetween(0.4, 0.56),
        colour: pickColour(),
        fuse: randomBetween(900, 1400),
      })
    }

    const drawFrame = (time: number) => {
      const elapsed = Math.min(time - lastFrameTime, 40)
      lastFrameTime = time

      if (isLaunching && time >= nextShellAt) {
        launchShell()
        if (Math.random() < 0.3) launchShell()
        nextShellAt = time + randomBetween(SHELL_INTERVAL.min, SHELL_INTERVAL.max)
      }

      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = "lighter"
      context.lineCap = "round"

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index]
        rocket.previousY = rocket.y
        rocket.velocityY += GRAVITY * elapsed
        rocket.x += rocket.velocityX * elapsed
        rocket.y += rocket.velocityY * elapsed
        rocket.fuse -= elapsed

        context.beginPath()
        context.moveTo(rocket.x, rocket.previousY)
        context.lineTo(rocket.x, rocket.y)
        context.lineWidth = 2.2
        context.strokeStyle = `rgba(${rocket.colour}, 0.85)`
        context.stroke()

        if (rocket.velocityY >= 0 || rocket.fuse <= 0) {
          explode(rocket)
          rockets.splice(index, 1)
        }
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index]
        spark.life -= elapsed
        if (spark.life <= 0) {
          sparks.splice(index, 1)
          continue
        }

        spark.previousX = spark.x
        spark.previousY = spark.y
        spark.velocityX *= DRAG
        spark.velocityY = spark.velocityY * DRAG + GRAVITY * elapsed
        spark.x += spark.velocityX * elapsed
        spark.y += spark.velocityY * elapsed

        const fade = spark.life / spark.maxLife
        context.beginPath()
        context.moveTo(spark.previousX, spark.previousY)
        context.lineTo(spark.x, spark.y)
        context.lineWidth = spark.size
        context.strokeStyle = `rgba(${spark.colour}, ${fade * 0.9})`
        context.stroke()
      }

      context.globalCompositeOperation = "source-over"
      animationFrame = requestAnimationFrame(drawFrame)
    }

    resizeCanvas()
    lastFrameTime = performance.now()
    animationFrame = requestAnimationFrame(drawFrame)

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      flashContext.revert()
    }
  }, [isBurstVisible, phase])

  if (theme !== "new-year" || reducedMotion) return null

  return (
    <AnimatePresence>
      {isBurstVisible && (
        <motion.div
          className="new-year-fireworks-event"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === "fading" ? BURST_FADE_MS / 1000 : 0.4, ease: "easeOut" }}>
          <div ref={flashRef} className="new-year-fireworks-flash" style={{ opacity: 0 }} />
          <canvas ref={canvasRef} className="new-year-fireworks-canvas" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
