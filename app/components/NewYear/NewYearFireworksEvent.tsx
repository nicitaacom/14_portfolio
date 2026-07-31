"use client"

import { useEffect, useRef, useState } from "react"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useSiteTheme } from "@/hooks/useSiteTheme"
import { useNewYearAmbience } from "@/store/useNewYearAmbience"

type FireworksPhase = "idle" | "burst" | "fading"

const INITIAL_EVENT_DELAY = { min: 16_000, max: 28_000 }
const REPEAT_EVENT_DELAY = { min: 40_000, max: 60_000 }
const BURST_DURATION = { min: 4_500, max: 6_500 }
/* How long the closing shells are given to finish on their own before the display is reset
   regardless. Only a backstop — normally the canvas reports the sky empty well inside this,
   and the longest a shell needs is its climb plus the longest spark life */
const MAX_SETTLE_MS = 8_000
const RETRY_DELAY = 10_000
const SHELL_INTERVAL = { min: 420, max: 980 }

/* Lifted off the surface palette: these sit against the night sky, where the 48% crimson and
   44% fir of the token block read as mud. Two blues are in the set because the sky behind them
   is already blue — a shell has to sit well above that to register as its own colour, so both
   are pushed light rather than picked from the deeper end of the theme */
const SHELL_COLOURS = [
  "255, 90, 108",
  "247, 178, 59",
  "255, 253, 250",
  "126, 214, 168",
  "217, 195, 151",
  "124, 196, 255",
  "96, 156, 255",
]

const GRAVITY = 0.00028
const DRAG = 0.9986

/* Where the shells open, as a fraction of viewport height measured from the top — the band of
   sky above the tallest thing the page draws. Stated as a target the rocket is aimed at rather
   than left to a fuse timer, so the burst lands in the same part of the sky on a phone and on
   a tall desktop screen instead of wherever the climb happened to run out */
const BURST_ALTITUDE = { min: 0.1, max: 0.38 }
/* Enough overshoot in the launch speed that the shell is still climbing when it reaches its
   target, so it opens on the way up rather than stalling into it */
const CLIMB_MARGIN = 1.06

/* The settings for the display that runs while the ambience track is on. Everything here reads
   as distance: shells open higher up and smaller, dimmer, with fewer and shorter-lived sparks,
   at a lazier rate. There is no trail either — at this range the climb would not be visible,
   only the flash at the top of it. Together these are what separate "somewhere across town"
   from the close-up display that fires on its own every minute */
/* The band starts below the navbar plate rather than at the very top of the viewport. The plate
   is around 66px tall and the layer paints under it, so shells aimed higher than this open
   behind it and are never seen — which at the old 5% floor was most of them on a short window */
const DISTANT_ALTITUDE = { min: 0.15, max: 0.32 }
/* 1.3x the rate, so the gaps are the old ones divided by 1.3 rather than a new pair of numbers */
const DISTANT_SHELL_INTERVAL = { min: 850, max: 2_150 }
/* A town does not fire at a steady rate for an hour. The distant display runs for a stretch,
   goes quiet, then picks up again — without the quiet the even spacing is what gives it away as
   a loop. Both are ranges rather than fixed lengths so the pattern never becomes countable */
const DISTANT_RUN = { min: 8_000, max: 12_000 }
const DISTANT_LULL = { min: 3_000, max: 6_000 }
const DISTANT_SPARK_COUNT = { min: 42, max: 66 }
const DISTANT_POWER = { min: 0.09, max: 0.14 }
const DISTANT_SPARK_LIFE = { min: 850, max: 1_500 }
const DISTANT_ALPHA = 0.72
const DISTANT_FLASH_OPACITY = 0.16

interface Rocket {
  x: number
  y: number
  previousY: number
  velocityX: number
  velocityY: number
  colour: string
  targetY: number
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
  /* Read per frame instead of captured, so the draw loop survives the change from launching to
     letting the sky clear */
  const isLaunchingRef = useRef(false)
  const handleBurstSettledRef = useRef<(() => void) | null>(null)
  /* The navbar toggle drives this. Held in a ref for the same reason as isLaunchingRef: the draw
     loop reads it every frame and rebuilding the effect would empty the sky */
  const { isAmbienceOn } = useNewYearAmbience()
  const isAmbienceOnRef = useRef(isAmbienceOn)
  const previousAmbienceRef = useRef(isAmbienceOn)
  const handleAmbienceChangeRef = useRef<((isOn: boolean) => void) | null>(null)

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
      /* The distant display has no gaps to wait out — it runs for as long as the sound is on,
         so the next event is the next frame rather than the next minute */
      if (isAmbienceOnRef.current) {
        schedule(beginEvent, 0)
        return
      }

      const delay = initial
        ? randomBetween(INITIAL_EVENT_DELAY.min, INITIAL_EVENT_DELAY.max)
        : randomBetween(REPEAT_EVENT_DELAY.min, REPEAT_EVENT_DELAY.max)
      schedule(beginEvent, delay)
    }

    /* Launching stops here and nothing else does. The shells already climbing still open, and
       their sparks still burn down, because the canvas reports back when the sky is empty */
    const finishEvent = () => {
      updatePhase("fading")
      /* A backstop in case that report never arrives, so the display always resets */
      schedule(() => {
        if (currentPhase !== "fading") return
        updatePhase("idle")
        scheduleNextEvent()
      }, MAX_SETTLE_MS)
    }

    handleBurstSettledRef.current = () => {
      if (currentPhase !== "fading") return
      clearTimers()
      updatePhase("idle")
      scheduleNextEvent()
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
      /* Nothing to time while the ambience runs. The sky stays busy until the toggle is pressed
         again, and that is what starts the wind-down instead */
      if (isAmbienceOnRef.current) return

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

      /* Coming back from a modal or a hidden tab picks the display straight back up while the
         ambience is on, rather than leaving the sound running over an empty sky for ten seconds */
      if (currentPhase === "idle" && timers.size === 0) {
        schedule(beginEvent, isAmbienceOnRef.current ? 0 : RETRY_DELAY)
      }
    }

    /* Test hook: dispatching new-year:fireworks on window starts a burst at once, so the
       display does not have to be waited out */
    const triggerForPreview = () => {
      clearTimers()
      beginEvent()
    }

    /* Pressing the navbar toggle either opens the distant display at once or begins winding the
       running one down. Winding down goes through finishEvent rather than straight to idle, so
       whatever is already in the air still opens and burns out */
    handleAmbienceChangeRef.current = isOn => {
      clearTimers()
      if (isOn) beginEvent()
      else if (currentPhase === "burst") finishEvent()
      else scheduleNextEvent()
    }

    scheduleNextEvent(true)
    const bodyObserver = new MutationObserver(cancelWhileUnavailable)
    bodyObserver.observe(document.body, { attributeFilter: ["class"], attributes: true })
    document.addEventListener("visibilitychange", cancelWhileUnavailable)
    window.addEventListener("new-year:fireworks", triggerForPreview)

    return () => {
      isMounted = false
      scheduleBurstFinishRef.current = null
      handleBurstSettledRef.current = null
      handleAmbienceChangeRef.current = null
      clearTimers()
      bodyObserver.disconnect()
      document.removeEventListener("visibilitychange", cancelWhileUnavailable)
      window.removeEventListener("new-year:fireworks", triggerForPreview)
    }
  }, [reducedMotion, theme])

  /* Kept in a ref so the draw loop can read it without being rebuilt when it changes */
  useEffect(() => {
    isLaunchingRef.current = phase === "burst"
  }, [phase])

  /* The ref is updated on every render, but the state machine is only told about real changes:
     firing on mount would clear the opening delay and put a display on screen straight away */
  useEffect(() => {
    isAmbienceOnRef.current = isAmbienceOn
    if (previousAmbienceRef.current === isAmbienceOn) return

    previousAmbienceRef.current = isAmbienceOn
    handleAmbienceChangeRef.current?.(isAmbienceOn)
  }, [isAmbienceOn])

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
    let hasReportedSettled = false
    /* Only consulted while the ambience runs. quietUntil is when the current lull ends and
       nextLullAt is when the next one starts, both stamped forward as each one is entered */
    let quietUntil = 0
    let nextLullAt = performance.now() + randomBetween(DISTANT_RUN.min, DISTANT_RUN.max)
    const rockets: Rocket[] = []
    const sparks: Spark[] = []
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
      /* A shell across town lights the sky it is in, not the room you are standing in */
      const peak = isAmbienceOnRef.current ? DISTANT_FLASH_OPACITY : 0.34
      flashContext.add(() => {
        gsap.fromTo(flash, { opacity: peak }, { opacity: 0, duration: 0.5, ease: "power2.out", overwrite: true })
      })
    }

    const explode = (rocket: Rocket) => {
      const isDistant = isAmbienceOnRef.current
      const sparkCount = isDistant
        ? Math.round(randomBetween(DISTANT_SPARK_COUNT.min, DISTANT_SPARK_COUNT.max))
        : 78 + Math.floor(Math.random() * 42)
      const power = isDistant
        ? randomBetween(DISTANT_POWER.min, DISTANT_POWER.max)
        : 0.16 + Math.random() * 0.1

      for (let index = 0; index < sparkCount; index += 1) {
        const angle = (index / sparkCount) * Math.PI * 2 + Math.random() * 0.14
        /* Square-rooting a uniform sample spreads the sparks evenly over the disc instead of
           bunching them at the rim, which is what a real shell looks like */
        const speed = power * Math.sqrt(Math.random()) * (0.55 + Math.random() * 0.65)
        const maxLife = isDistant
          ? randomBetween(DISTANT_SPARK_LIFE.min, DISTANT_SPARK_LIFE.max)
          : randomBetween(1100, 2000)

        sparks.push({
          x: rocket.x,
          y: rocket.y,
          previousX: rocket.x,
          previousY: rocket.y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: isDistant ? 0.9 + Math.random() * 1 : 1.2 + Math.random() * 1.8,
          colour: Math.random() < 0.18 ? pickColour() : rocket.colour,
        })
      }

      flashAt(rocket.x, rocket.y)
    }

    const launchShell = () => {
      const x = randomBetween(width * 0.12, width * 0.88)
      const launchY = height + 8
      const altitude = isAmbienceOnRef.current ? DISTANT_ALTITUDE : BURST_ALTITUDE
      const targetY = height * randomBetween(altitude.min, altitude.max)
      /* The speed that just reaches the target under this gravity, plus the margin. Solving for
         it here is what keeps the burst height honest at any viewport size */
      const climbSpeed = Math.sqrt(2 * GRAVITY * (launchY - targetY)) * CLIMB_MARGIN

      rockets.push({
        x,
        y: launchY,
        previousY: launchY,
        velocityX: randomBetween(-0.03, 0.03),
        velocityY: -climbSpeed,
        colour: pickColour(),
        targetY,
      })
    }

    const drawFrame = (time: number) => {
      const elapsed = Math.min(time - lastFrameTime, 40)
      lastFrameTime = time

      /* The run has gone on long enough, so the sky goes quiet for a few seconds and the next
         lull is stamped for after that. Only the distant display does this — the close-up one
         is short enough already that a gap in the middle would read as a stall */
      if (isAmbienceOnRef.current && time >= nextLullAt && time >= quietUntil) {
        quietUntil = time + randomBetween(DISTANT_LULL.min, DISTANT_LULL.max)
        nextLullAt = quietUntil + randomBetween(DISTANT_RUN.min, DISTANT_RUN.max)
      }

      /* One shell at a time and a long wait between them while the ambience runs. Doubling up is
         what makes the close-up display read as a finale, which is the opposite of the intent */
      const interval = isAmbienceOnRef.current ? DISTANT_SHELL_INTERVAL : SHELL_INTERVAL
      const isQuiet = isAmbienceOnRef.current && time < quietUntil
      if (isLaunchingRef.current && !isQuiet && time >= nextShellAt) {
        launchShell()
        if (!isAmbienceOnRef.current && Math.random() < 0.3) launchShell()
        nextShellAt = time + randomBetween(interval.min, interval.max)
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

        /* The climb is skipped entirely at distance. A rising trail is a close-up detail — from
           across town the first thing anyone sees is the flash at the top of it */
        if (!isAmbienceOnRef.current) {
          context.beginPath()
          context.moveTo(rocket.x, rocket.previousY)
          context.lineTo(rocket.x, rocket.y)
          context.lineWidth = 2.6
          context.strokeStyle = `rgba(${rocket.colour}, 0.95)`
          context.stroke()
        }

        /* Reaching the target opens the shell. The stall check is the backstop for a rocket
           that loses its climb early, so none of them ever fall back down unopened */
        if (rocket.y <= rocket.targetY || rocket.velocityY >= 0) {
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

        const fade = (spark.life / spark.maxLife) * (isAmbienceOnRef.current ? DISTANT_ALPHA : 1)
        context.beginPath()
        context.moveTo(spark.previousX, spark.previousY)
        context.lineTo(spark.x, spark.y)
        context.lineWidth = spark.size
        context.strokeStyle = `rgba(${spark.colour}, ${fade})`
        context.stroke()
      }

      context.globalCompositeOperation = "source-over"

      /* Once launching has stopped and the last spark has burnt out there is nothing left to
         draw, so the display reports itself finished and the loop ends. Waiting for this rather
         than for a timer is what lets the closing shells play all the way out */
      if (!isLaunchingRef.current && rockets.length === 0 && sparks.length === 0) {
        if (!hasReportedSettled) {
          hasReportedSettled = true
          handleBurstSettledRef.current?.()
        }
        return
      }

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
    /* phase is deliberately absent. The rockets and sparks live in this effect, so listing it
       would rebuild them as empty arrays the moment launching stops and wipe every shell still
       in the air. Launching is read from a ref per frame instead, which lets one canvas span
       the whole display from first launch to last spark */
  }, [isBurstVisible])

  if (theme !== "new-year" || reducedMotion) return null

  return (
    <AnimatePresence>
      {isBurstVisible && (
        <motion.div
          className="new-year-fireworks-event"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          /* The layer holds full opacity for the whole display and leaves on an empty canvas,
             so this exit has nothing left to dim. It stays only to cover the backstop path,
             where the reset can arrive with sparks still on screen */
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}>
          <div ref={flashRef} className="new-year-fireworks-flash" style={{ opacity: 0 }} />
          <canvas ref={canvasRef} className="new-year-fireworks-canvas" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
