"use client"

import { useEffect, useId, useRef, useState } from "react"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"

import { useSiteTheme } from "@/hooks/useSiteTheme"
import { useScopedI18n } from "@/locales/client"

type HalloweenEventPhase = "idle" | "storm" | "fading"

interface RainDrop {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
}

const INITIAL_EVENT_DELAY = { min: 18_000, max: 30_000 }
const REPEAT_EVENT_DELAY = { min: 75_000, max: 130_000 }
const STORM_DURATION = { min: 4_000, max: 6_000 }
// The storm and grave run their entry animations backwards for this long before unmounting
const STORM_FADE_MS = 500
const RETRY_DELAY = 10_000

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min))
}

function StylizedGrave() {
  const t = useScopedI18n("common")
  const instanceId = useId().replace(/:/g, "")
  const stoneId = `halloween-grave-stone-${instanceId}`
  const stoneEdgeId = `halloween-grave-edge-${instanceId}`
  const mossId = `halloween-grave-moss-${instanceId}`
  const graveShadowId = `halloween-grave-shadow-${instanceId}`
  const graveTextureId = `halloween-grave-texture-${instanceId}`
  const graveGlowId = `halloween-grave-glow-${instanceId}`
  const faceGlowId = `halloween-grave-face-${instanceId}`
  const graveClipId = `halloween-grave-clip-${instanceId}`

  return (
    <svg
      aria-hidden="true"
      className="halloween-event-grave-svg h-full w-full overflow-visible"
      viewBox="0 0 560 650"
      fill="none">
      <defs>
        <linearGradient id={stoneId} x1="145" y1="82" x2="405" y2="508" gradientUnits="userSpaceOnUse">
          <stop stopColor="#778280" />
          <stop offset="0.38" stopColor="#4F5A5B" />
          <stop offset="0.74" stopColor="#30393D" />
          <stop offset="1" stopColor="#1E252A" />
        </linearGradient>
        <linearGradient id={stoneEdgeId} x1="118" y1="96" x2="424" y2="528" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B6C0B7" />
          <stop offset="0.28" stopColor="#687474" />
          <stop offset="0.76" stopColor="#20282D" />
          <stop offset="1" stopColor="#10151A" />
        </linearGradient>
        <linearGradient id={mossId} x1="178" y1="99" x2="350" y2="448" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8AA367" />
          <stop offset="0.45" stopColor="#526C45" />
          <stop offset="1" stopColor="#253C2D" />
        </linearGradient>
        <radialGradient id={graveGlowId} cx="0" cy="0" r="1" gradientTransform="translate(286 327) scale(214 255)">
          <stop stopColor="#CDE7CA" stopOpacity="0.34" />
          <stop offset="0.52" stopColor="#72916D" stopOpacity="0.11" />
          <stop offset="1" stopColor="#72916D" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={faceGlowId} cx="0" cy="0" r="1" gradientTransform="translate(283 266) scale(92 72)">
          <stop stopColor="#D6F1CF" stopOpacity="0.72" />
          <stop offset="1" stopColor="#78966F" stopOpacity="0" />
        </radialGradient>
        <filter id={graveShadowId} x="-35%" y="-30%" width="170%" height="185%">
          <feDropShadow dx="0" dy="25" stdDeviation="18" floodColor="#000000" floodOpacity="0.88" />
        </filter>
        <pattern
          id={graveTextureId}
          width="58"
          height="52"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-7)">
          <circle cx="8" cy="9" r="2.5" fill="#D1D7CF" fillOpacity="0.2" />
          <circle cx="38" cy="18" r="4" fill="#12191C" fillOpacity="0.28" />
          <circle cx="52" cy="43" r="2" fill="#C1CAC1" fillOpacity="0.16" />
          <path d="M2 34L19 30M28 48L47 45M46 3L57 1" stroke="#D4DAD2" strokeOpacity="0.12" strokeWidth="3" />
          <path d="M16 3L28 8M4 49L15 43" stroke="#11181C" strokeOpacity="0.24" strokeWidth="4" />
        </pattern>
        <clipPath id={graveClipId}>
          <path d="M151 487L139 205C136 154 153 110 190 83C224 58 268 54 307 64L330 48L350 75C398 98 423 143 418 201L399 487H151Z" />
        </clipPath>
      </defs>

      <ellipse cx="278" cy="567" rx="233" ry="50" fill="#020204" fillOpacity="0.72" />
      <ellipse
        data-halloween-grave-glow
        cx="283"
        cy="343"
        rx="232"
        ry="270"
        fill={`url(#${graveGlowId})`}
      />

      <g filter={`url(#${graveShadowId})`}>
        <path
          d="M85 512L131 479L421 475L469 509L449 549L107 553L85 512Z"
          fill="#171E21"
          stroke="#65706D"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path
          d="M109 506L143 486L408 484L447 509L424 526L132 529L109 506Z"
          fill="#465052"
          stroke="#838D87"
          strokeOpacity="0.48"
          strokeWidth="5"
        />
        <path
          d="M70 548L114 527L449 526L493 548L470 590L89 592L70 548Z"
          fill="#222A2D"
          stroke="#596467"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <path d="M92 550L470 548L448 570L111 572L92 550Z" fill="#4B5554" fillOpacity="0.72" />

        <path
          d="M151 487L139 205C136 154 153 110 190 83C224 58 268 54 307 64L330 48L350 75C398 98 423 143 418 201L399 487H151Z"
          fill={`url(#${stoneEdgeId})`}
          stroke="#12191D"
          strokeWidth="13"
          strokeLinejoin="round"
        />
        <path
          d="M171 469L160 204C158 160 173 126 204 103C236 80 276 78 312 90L330 76L340 96C377 115 397 151 393 198L377 469H171Z"
          fill={`url(#${stoneId})`}
          stroke="#88928C"
          strokeOpacity="0.58"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M171 469L160 204C158 160 173 126 204 103C236 80 276 78 312 90L330 76L340 96C377 115 397 151 393 198L377 469H171Z"
          fill={`url(#${graveTextureId})`}
          opacity="0.72"
        />

        <g clipPath={`url(#${graveClipId})`}>
          <path
            d="M139 191C181 180 206 198 235 184C270 167 294 180 322 168C354 155 386 168 422 155"
            stroke="#B7C0B8"
            strokeOpacity="0.18"
            strokeWidth="18"
          />
          <path
            d="M144 362C188 347 227 366 265 351C307 335 351 359 411 333M151 419C210 400 252 421 293 404C335 386 367 399 405 386"
            stroke="#10171B"
            strokeOpacity="0.25"
            strokeWidth="15"
          />
          <path
            d="M157 111C185 100 207 114 222 139C199 134 189 152 168 149L157 111ZM367 101C392 120 403 145 397 177C382 159 366 171 351 149L367 101Z"
            fill={`url(#${mossId})`}
          />
          <path
            d="M167 111C188 128 189 149 177 174M375 111C371 137 381 150 394 160"
            stroke="#A2B87B"
            strokeOpacity="0.5"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        <path
          d="M207 182L237 154L271 169L304 144L348 177L332 222L300 238L244 230L207 182Z"
          fill="#303A3D"
          stroke="#9AA49D"
          strokeOpacity="0.56"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <ellipse cx="276" cy="191" rx="18" ry="22" fill="#10171A" />
        <ellipse cx="316" cy="188" rx="18" ry="22" fill="#10171A" />
        <path d="M296 202L283 221H308L296 202Z" fill="#11181B" />
        <path d="M249 224C273 245 316 247 340 220M269 231V247M293 234V251M317 230V246" stroke="#11181B" strokeWidth="7" />
        <ellipse
          data-halloween-grave-face
          cx="295"
          cy="204"
          rx="92"
          ry="72"
          fill={`url(#${faceGlowId})`}
          opacity="0.18"
        />

        <text
          x="283"
          y="337"
          fill="#C0C7BC"
          stroke="#182024"
          strokeWidth="3"
          paintOrder="stroke"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="70"
          fontWeight="900"
          letterSpacing="8">
          {t("halloweenGraveEpitaph")}
        </text>
        <path
          d="M202 374C247 389 318 390 365 371"
          stroke="#AEB7AF"
          strokeOpacity="0.34"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <g stroke="#141C20" strokeLinecap="round" strokeLinejoin="round">
          <path d="M174 227L213 258L199 294L239 320L216 357" strokeWidth="10" />
          <path d="M392 251L356 280L369 311L337 339L348 379" strokeWidth="9" />
          <path d="M296 85L282 121L302 145L281 169" strokeWidth="8" />
          <path d="M214 258L239 248M199 294L177 310M356 280L332 266M369 311L392 324" strokeWidth="6" />
        </g>
        <g stroke="#A9B2AA" strokeLinecap="round" strokeOpacity="0.22">
          <path d="M178 224L216 256L202 293" strokeWidth="3" />
          <path d="M395 249L359 279L372 309" strokeWidth="3" />
        </g>

        <path
          d="M151 431C183 418 207 439 231 427C258 413 282 429 304 418C333 404 360 424 401 406L399 487H151V431Z"
          fill={`url(#${mossId})`}
          fillOpacity="0.78"
        />
        <path
          d="M168 438C179 452 174 469 181 486M213 432C229 448 219 467 225 487M317 426C307 446 318 466 311 487M370 418C354 443 365 462 356 486"
          stroke="#95AD70"
          strokeOpacity="0.44"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      <g className="halloween-event-weeds" strokeLinecap="round">
        <path d="M119 570C99 538 83 523 56 514M112 565C113 529 104 505 84 484M435 568C452 534 471 513 504 500M443 568C442 532 455 501 477 480" stroke="#38543A" strokeWidth="10" />
        <path d="M114 562C89 544 74 542 52 544M441 558C464 539 482 536 510 539" stroke="#72865A" strokeOpacity="0.62" strokeWidth="5" />
      </g>
      <path
        d="M28 590C86 569 130 598 186 583C242 568 311 598 368 580C423 563 479 595 536 576V650H28V590Z"
        fill="#08070A"
      />
      <path
        d="M28 591C91 571 132 599 188 584C248 568 308 600 372 581C430 563 477 595 536 578"
        stroke="#342B39"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HalloweenGraveEvent() {
  const [phase, setPhase] = useState<HalloweenEventPhase>("idle")
  const [stormPlaybackStarted, setStormPlaybackStarted] = useState(false)
  const reducedMotion = useReducedMotion()
  const theme = useSiteTheme()
  const eventRef = useRef<HTMLDivElement>(null)
  const rainCanvasRef = useRef<HTMLCanvasElement>(null)
  const thunderAudioRef = useRef<HTMLAudioElement>(null)
  const bellsAudioRef = useRef<HTMLAudioElement>(null)
  const scheduleStormFinishRef = useRef<(() => void) | null>(null)
  // Stays true across the fade so the lightning and rain keep running while the storm bows out,
  // instead of the GSAP context reverting and freezing the canvas the moment the phase flips
  const isStormVisible = phase === "storm" || phase === "fading"

  useEffect(() => {
    if (theme !== "halloween" || reducedMotion) {
      ;[thunderAudioRef.current, bellsAudioRef.current].forEach(audio => {
        if (!audio) return
        gsap.killTweensOf(audio)
        audio.pause()
        audio.currentTime = 0
      })
      setPhase("idle")
      return
    }

    let isMounted = true
    let currentPhase: HalloweenEventPhase = "idle"
    const timers = new Set<ReturnType<typeof setTimeout>>()

    const isUnavailable = () => document.hidden || document.body.classList.contains("modal-open")
    const updatePhase = (nextPhase: HalloweenEventPhase) => {
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
    const stopStormAudio = (immediate = false) => {
      ;[thunderAudioRef.current, bellsAudioRef.current].forEach(audio => {
        if (!audio) return
        gsap.killTweensOf(audio)

        if (immediate || audio.paused) {
          audio.pause()
          audio.currentTime = 0
          return
        }

        gsap.to(audio, {
          volume: 0,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => {
            audio.pause()
            audio.currentTime = 0
          },
        })
      })
    }
    const scheduleNextEvent = (initial = false) => {
      const delay = initial
        ? randomBetween(INITIAL_EVENT_DELAY.min, INITIAL_EVENT_DELAY.max)
        : randomBetween(REPEAT_EVENT_DELAY.min, REPEAT_EVENT_DELAY.max)
      schedule(beginEvent, delay)
    }

    const finishEvent = () => {
      // Audio fades over 0.55s, so hold the visuals in "fading" for the matching stretch
      // and only unmount once the reversed entry animation has played out
      stopStormAudio()
      updatePhase("fading")
      schedule(() => {
        updatePhase("idle")
        scheduleNextEvent()
      }, STORM_FADE_MS)
    }

    function beginEvent() {
      if (isUnavailable()) {
        updatePhase("idle")
        schedule(beginEvent, RETRY_DELAY)
        return
      }

      setStormPlaybackStarted(false)
      updatePhase("storm")
    }

    scheduleStormFinishRef.current = () => {
      schedule(() => {
        if (isUnavailable()) {
          clearTimers()
          stopStormAudio(true)
          updatePhase("idle")
          schedule(beginEvent, RETRY_DELAY)
          return
        }

        finishEvent()
      }, randomBetween(STORM_DURATION.min, STORM_DURATION.max))
    }

    const cancelWhileUnavailable = () => {
      if (isUnavailable()) {
        clearTimers()
        stopStormAudio(true)
        updatePhase("idle")
        return
      }

      if (currentPhase === "idle" && timers.size === 0) schedule(beginEvent, RETRY_DELAY)
    }

    const triggerForPreview = () => {
      clearTimers()
      stopStormAudio(true)
      beginEvent()
    }

    scheduleNextEvent(true)
    const bodyObserver = new MutationObserver(cancelWhileUnavailable)
    bodyObserver.observe(document.body, { attributeFilter: ["class"], attributes: true })
    document.addEventListener("visibilitychange", cancelWhileUnavailable)
    window.addEventListener("halloween:grave-event", triggerForPreview)

    return () => {
      isMounted = false
      scheduleStormFinishRef.current = null
      clearTimers()
      stopStormAudio(true)
      bodyObserver.disconnect()
      document.removeEventListener("visibilitychange", cancelWhileUnavailable)
      window.removeEventListener("halloween:grave-event", triggerForPreview)
    }
  }, [reducedMotion, theme])

  useEffect(() => {
    if (phase !== "storm") return

    let isCancelled = false
    let hasSynchronized = false
    const startTrack = (audio: HTMLAudioElement | null, volume: number) => {
      if (!audio) return null

      gsap.killTweensOf(audio)
      audio.pause()
      audio.currentTime = 0
      audio.volume = volume
      return audio.play()
    }
    const synchronizeStorm = () => {
      if (isCancelled || hasSynchronized) return
      hasSynchronized = true
      setStormPlaybackStarted(true)
      scheduleStormFinishRef.current?.()
    }

    const thunderPlayback = startTrack(thunderAudioRef.current, 0.72)
    void startTrack(bellsAudioRef.current, 0.16)?.catch(() => {
      // The thunder track remains the synchronization source when the optional bells cannot play.
    })

    if (thunderPlayback) {
      void thunderPlayback.then(synchronizeStorm).catch(synchronizeStorm)
    } else {
      synchronizeStorm()
    }

    return () => {
      isCancelled = true
    }
  }, [phase])

  useEffect(() => {
    if (!isStormVisible || !stormPlaybackStarted || !eventRef.current) return

    const animationContext = gsap.context(() => {
      const stormTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1.65 })
      stormTimeline
        .set("[data-halloween-storm-flash]", { opacity: 0 })
        .set("[data-halloween-lightning]", { opacity: 0 })
        .to("[data-halloween-storm-flash]", { opacity: 0.48, duration: 0.07, ease: "power4.out" })
        .to("[data-halloween-lightning='near']", { opacity: 0.92, duration: 0.04 }, "<")
        .to("[data-halloween-storm-flash]", { opacity: 0, duration: 0.24, ease: "power2.in" })
        .to("[data-halloween-lightning]", { opacity: 0, duration: 0.18 }, "<")
        .to("[data-halloween-storm-flash]", { opacity: 0.25, duration: 0.08, ease: "power3.out" }, "+=0.72")
        .to("[data-halloween-lightning='far']", { opacity: 0.6, duration: 0.05 }, "<")
        .to("[data-halloween-storm-flash]", { opacity: 0, duration: 0.3, ease: "power2.in" })
        .to("[data-halloween-lightning]", { opacity: 0, duration: 0.2 }, "<")

      gsap.to("[data-halloween-grave-glow]", {
        opacity: 0.58,
        duration: 1.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
      gsap.to("[data-halloween-grave-face]", {
        opacity: 0.46,
        duration: 0.7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
    }, eventRef)

    return () => animationContext.revert()
  }, [isStormVisible, stormPlaybackStarted])

  useEffect(() => {
    if (!isStormVisible || !stormPlaybackStarted) return

    const canvas = rainCanvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let animationFrame = 0
    let previousTime = performance.now()
    const rainDrops: RainDrop[] = Array.from({ length: 96 }, (_, index) => ({
      x: (index * 0.618033 + 0.07) % 1,
      y: (index * 0.381966 + 0.11) % 1,
      length: 13 + (index % 7) * 4,
      speed: 0.00045 + (index % 9) * 0.00006,
      opacity: 0.12 + (index % 5) * 0.035,
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

    const drawRain = (time: number) => {
      const elapsed = Math.min(40, time - previousTime)
      previousTime = time
      context.clearRect(0, 0, width, height)
      context.lineCap = "round"
      context.lineWidth = 1.1

      rainDrops.forEach(drop => {
        drop.y += drop.speed * elapsed
        drop.x -= drop.speed * elapsed * 0.2
        if (drop.y > 1.08) {
          drop.y = -0.08
          drop.x = (drop.x + 0.43) % 1
        }
        if (drop.x < -0.08) drop.x = 1.08

        const x = drop.x * width
        const y = drop.y * height
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x - drop.length * 0.28, y + drop.length)
        context.strokeStyle = `rgba(185, 202, 212, ${drop.opacity})`
        context.stroke()
      })

      animationFrame = requestAnimationFrame(drawRain)
    }

    resizeCanvas()
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    animationFrame = requestAnimationFrame(drawRain)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [isStormVisible, stormPlaybackStarted])

  if (theme !== "halloween") return null

  return (
    <div
      ref={eventRef}
      className="halloween-grave-event halloween-grave-event-foreground pointer-events-none fixed inset-0"
      aria-hidden="true">
      <audio ref={thunderAudioRef} src="/thunderstorm.mp3" preload="auto" />
      <audio ref={bellsAudioRef} src="/creepy-halloween-bells.mp3" preload="auto" />
      <AnimatePresence mode="sync">
        {isStormVisible && (
          <motion.div
            key="storm"
            className="halloween-storm-layer absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "fading" || !stormPlaybackStarted ? 0 : 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: phase === "fading" ? STORM_FADE_MS / 1000 : stormPlaybackStarted ? 0.12 : 0 }}>
            <canvas ref={rainCanvasRef} className="halloween-storm-rain absolute inset-0 h-full w-full" />
            <div data-halloween-storm-flash className="halloween-storm-flash absolute inset-0" />
            <svg
              className="halloween-lightning absolute inset-0 h-full w-full"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none">
              <defs>
                <linearGradient id="halloween-lightning-core" x1="1044" y1="-30" x2="964" y2="452">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.52" stopColor="#E5F4E1" />
                  <stop offset="1" stopColor="#9FC19D" />
                </linearGradient>
                <filter id="halloween-lightning-glow" x="-60%" y="-35%" width="220%" height="190%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
                <path
                  id="halloween-lightning-near-main"
                  d="M1104-30C1102 31 1071 79 1082 126L1045 172L1058 204L1019 251L1027 283L975 343L990 379L939 452"
                />
                <path id="halloween-lightning-near-branch-a" d="M1057 203L1100 233L1081 277" />
                <path id="halloween-lightning-near-branch-b" d="M1020 251L975 270L950 316" />
                <path id="halloween-lightning-near-branch-c" d="M989 378L1033 401L1019 437" />
                <path
                  id="halloween-lightning-far-main"
                  d="M335-24C333 16 313 53 320 86L293 118L301 143L269 177L275 204L244 248"
                />
                <path id="halloween-lightning-far-branch-a" d="M300 143L335 161L326 190" />
                <path id="halloween-lightning-far-branch-b" d="M276 204L242 215L224 243" />
              </defs>
              <g data-halloween-lightning="near" strokeLinecap="round" strokeLinejoin="round">
                <g
                  stroke="#DDF1D9"
                  strokeOpacity="0.46"
                  strokeWidth="18"
                  filter="url(#halloween-lightning-glow)">
                  <use href="#halloween-lightning-near-main" />
                  <use href="#halloween-lightning-near-branch-a" />
                  <use href="#halloween-lightning-near-branch-b" />
                  <use href="#halloween-lightning-near-branch-c" />
                </g>
                <g stroke="url(#halloween-lightning-core)" strokeWidth="4">
                  <use href="#halloween-lightning-near-main" />
                  <use href="#halloween-lightning-near-branch-a" />
                  <use href="#halloween-lightning-near-branch-b" />
                  <use href="#halloween-lightning-near-branch-c" />
                </g>
                <use
                  href="#halloween-lightning-near-main"
                  stroke="#FFFFFF"
                  strokeLinecap="round"
                  strokeWidth="1.4"
                />
              </g>
              <g
                data-halloween-lightning="far"
                stroke="#D8D0E2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <g strokeOpacity="0.34" strokeWidth="13" filter="url(#halloween-lightning-glow)">
                  <use href="#halloween-lightning-far-main" />
                  <use href="#halloween-lightning-far-branch-a" />
                  <use href="#halloween-lightning-far-branch-b" />
                </g>
                <g strokeWidth="3">
                  <use href="#halloween-lightning-far-main" />
                  <use href="#halloween-lightning-far-branch-a" />
                  <use href="#halloween-lightning-far-branch-b" />
                </g>
              </g>
            </svg>
            <motion.div
              className="halloween-event-grave absolute"
              initial={{ opacity: 0, y: "24%", rotate: -3, scale: 0.84 }}
              animate={
                phase === "fading" || !stormPlaybackStarted
                  ? { opacity: 0, y: "24%", rotate: -3, scale: 0.84 }
                  : { opacity: 1, y: "0%", rotate: 0, scale: 1 }
              }
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{
                // Sinks back to exactly the values it rose from. A true time-reverse of the
                // entry curve would be easeIn, which holds full opacity then snaps at the end
                // and reads as no fade at all, so the way back is eased on both ends instead
                duration: phase === "fading" ? STORM_FADE_MS / 1000 : 1.35,
                ease: phase === "fading" ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1],
              }}>
              <StylizedGrave />
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
