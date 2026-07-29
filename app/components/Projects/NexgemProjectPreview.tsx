"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { FiCode, FiShield, FiVolume2 } from "react-icons/fi"
import { useScopedI18n } from "@/locales/client"

/** 4 blinks at 1s + three 400ms lines spaced 250ms apart */
const REPLY_SEQUENCE_MS = 5700

/**
 * Full, because the takes themselves are quiet. Their peaks run from -19 dBFS down to -44.8 dBFS, so the old
 * 0.35 took another 9dB off and left the quietest of them around -54 dBFS — playing, but under the point
 * anyone would hear it against the page's own ambience.
 */
const HOVER_SOUND_VOLUME = 1
/** Names the clip on screen while it sounds, so a ring that reads wrong can be traced to its file */
const IS_DEV = process.env.NODE_ENV === "development"
/** Only the head of the ladder is worth fetching up front — the long takes weigh ~950KB between them */
const EAGER_CLIP_COUNT = 4

/** One hyphen of rest */
const BEAT_MS = 300
/** A ring lands this long before the next one starts, so two are never travelling together */
const RING_LEAD_MS = 100
/** What a word with no hyphen after it gets, since there is nothing there to size its ring from */
const FINAL_RING_MS = 900
/** A run of rest marks between two words */
const REST_PATTERN = /^[-_]+$/

type NexgemHoverGroup = "outer" | "centre"
type NexgemPulseKind = "in" | "out"

interface NexgemPulse {
  at: number
  ms: number
  kind: NexgemPulseKind
}

interface NexgemStep {
  src: string
  group: NexgemHoverGroup
  pulses: NexgemPulse[]
}

/**
 * ── THE ONE PLACE TIMING IS WRITTEN ──────────────────────────────────────────────────────────────────────
 *
 * Second column is the score for that clip. Write it by ear.
 *
 *   req            a pulse in — a ring contracting into the hub
 *   resp           a pulse out — a ring swelling away from it
 *   -              300ms of rest, drawn. Two hyphens 600ms, three 900ms, and so on
 *   _              300ms of rest, not drawn — the ring has already landed and the clip simply runs on
 *
 * Both marks push the next pulse back by the same 300ms. The difference is what they do to the ring in front
 * of them: it lasts as long as the hyphens after it, less 100ms, and underscores add nothing to it. So one
 * hyphen draws a 200ms ring and three draw an 800ms one, while `resp---__` still draws for 800ms and then
 * holds for 600ms of nothing before whatever is next. A word with no hyphen after it gets 900ms.
 *
 * The first word decides which icons unlock the step — `req` waits on any of the four outer icons, `resp` on
 * the hub. Hovering the other group does nothing.
 *
 *   ["req-9", "req------resp------------req------resp"]
 *        in at 0ms, out at 1800ms, in at 5400ms, out at 7200ms
 *
 * These began as the names the clips used to have, where one hyphen meant a second. At 300ms a hyphen is
 * worth a third of what it was, so every run in those names is written three times as long here.
 */
const HOVER_SOUND_SCRIPT: [stem: string, score: string][] = [
  ["req-1", "req-----"],
  ["resp-1", "resp"],
  ["req-2", "__req"],
  ["resp-2", "resp"],
  ["req-3", "req"],
  ["resp-3", "resp"],
  ["req-4", "req"],
  ["resp-4", "resp"],
  ["req-5", "req"],
  ["resp-5", "resp"],
  ["req-6", "req"],
  ["resp-6", "resp"],
  ["req-7", "req-------resp"],
  ["req-8", "req-------resp-------req"],
  ["req-9", "req-------resp-----------__req--------resp"],
  ["req-10", "req-----___resp-----________req---____resp----___req"],
  ["req-11", "req---resp----resp----resp-------resp----req---resp---resp---resp--------resp"],
  ["req-12", "req---resp----resp----resp-------resp----req---resp---resp---resp--------resp"],
  // req-13 and req-14 are gone from public/, so they are gone from here too
]

/** Reads one score into the pulses it describes. Done once here — the playlist never changes */
function parseScore(score: string): NexgemPulse[] {
  const tokens = score.split(/([-_]+)/)
  const pulses: NexgemPulse[] = []
  let at = 0

  tokens.forEach((token, index) => {
    // Both marks push the next pulse back by the same 300ms each. Only the hyphens among them draw
    if (REST_PATTERN.test(token)) {
      at += token.length * BEAT_MS
      return
    }
    if (token !== "req" && token !== "resp") return

    const drawnBeats = tokens[index + 1]?.match(/-/g)?.length ?? 0
    const ms = drawnBeats > 0 ? drawnBeats * BEAT_MS - RING_LEAD_MS : FINAL_RING_MS
    pulses.push({ at, ms, kind: token === "req" ? "in" : "out" })
  })

  return pulses
}

const HOVER_SOUND_PLAYLIST: NexgemStep[] = HOVER_SOUND_SCRIPT.map(([stem, score]) => ({
  src: `/${stem}.mp3`,
  group: stem.startsWith("resp") ? "centre" : "outer",
  pulses: parseScore(score),
}))

interface NexgemNodeProps {
  x: number
  y: number
  pulseDelay: string
  onEnter: () => void
  children: ReactNode
}

/** One workflow node on the canvas — shell, rim, and the two connector ports the edges dock into */
function NexgemNode({ x, y, pulseDelay, onEnter, children }: NexgemNodeProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        className="nexgem-node-pulse"
        style={{ animationDelay: pulseDelay }}
        x="-4"
        y="-4"
        width="120"
        height="88"
        rx="16"
        fill="none"
        stroke="hsl(var(--cta))"
        strokeWidth="2"
      />
      <rect
        width="112"
        height="80"
        rx="12"
        fill="url(#nexgem-node-metal)"
        stroke="url(#nexgem-node-rim)"
        strokeWidth="2"
      />
      <rect x="1.5" y="1.5" width="109" height="77" rx="11" fill="none" stroke="white" strokeOpacity="0.07" />
      <circle cx="0" cy="40" r="5" fill="#0B0A12" stroke="hsl(var(--cta))" strokeOpacity="0.55" strokeWidth="2" />
      <circle cx="112" cy="40" r="5" fill="#0B0A12" stroke="hsl(var(--cta))" strokeOpacity="0.55" strokeWidth="2" />
      {children}
      {/* One solid hit target on top. The shapes above leave gaps between the shell and the pulse ring,
          and crossing those gaps fires a spurious burst of enters on the way out of the node.

          onMouseOver, not onMouseEnter. React builds enter out of mouseover/mouseout pairs and steps aside
          when the pointer arrives from another element it owns — coming in off the parent <svg> is exactly
          that, so a real mouse got no enter here at all while a synthetic one did. mouseover is delivered
          straight through, and this rect has no children for it to bubble up from, so it reads as an enter */}
      <rect x="-4" y="-4" width="120" height="88" rx="16" fill="transparent" onMouseOver={onEnter} />
    </g>
  )
}

export function NexgemProjectPreview() {
  const t = useScopedI18n("nexgemProject.preview")
  // Bumping this remounts the widget group, which replays the whole answer from the first blink
  const [replyRun, setReplyRun] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const idleMs = 10000 + Math.random() * 5000
    const timeout = window.setTimeout(() => setReplyRun(run => run + 1), REPLY_SEQUENCE_MS + idleMs)

    return () => window.clearTimeout(timeout)
  }, [replyRun])

  // Nothing to hover on a touch screen, so the clips are never even fetched there
  const [isHoverSoundOn, setIsHoverSoundOn] = useState(false)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const stepRef = useRef(0)
  const isSoundingRef = useRef(false)
  const pulseTimeoutsRef = useRef<number[]>([])
  const pulseRunRef = useRef(0)
  const isUnlockedRef = useRef(false)
  // More than one at a time on purpose: these takes overlap, so a call can open while the answer before it
  // is still ringing, and each gets its own. Every entry is keyed on its run, and mounting is what starts
  // the animation — re-adding a class to a ring already on screen would not
  const [rings, setRings] = useState<{ run: number; kind: NexgemPulseKind; ms: number }[]>([])
  const [nowPlaying, setNowPlaying] = useState<string | null>(null)
  // The prompt runs in two beats: ask for the click the browser needs, then point at what to do with it
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [hasHovered, setHasHovered] = useState(false)

  useEffect(() => {
    setIsHoverSoundOn(
      window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    )
  }, [])

  useEffect(() => {
    const clips = audioRefs.current
    const pulseTimeouts = pulseTimeoutsRef.current

    return () => {
      pulseTimeouts.forEach(id => window.clearTimeout(id))
      clips.forEach(audio => {
        if (!audio) return
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [])

  /**
   * Chrome refuses play() on anything audible until the page has had a real interaction. Hovering is not one
   * and neither is scrolling with a wheel, so a visitor who lands, scrolls down and hovers gets silence — the
   * call comes back NotAllowedError. Firing a synthetic click changes nothing: an event the page made itself
   * is untrusted and grants no permission.
   *
   * So the widget asks for the interaction outright. This runs inside that click, starting every clip muted
   * and stopping it again, which is what marks the element as allowed. Hover plays them outright afterwards.
   */
  const handleTurnOnSound = () => {
    setIsSoundOn(true)
    if (isUnlockedRef.current) return
    isUnlockedRef.current = true

    audioRefs.current.forEach(audio => {
      if (!audio) return

      audio.muted = true
      void audio.play()?.then(
        () => {
          // A hover can land while this is still settling. It unmutes the clip on its way in, so an
          // unmuted one here means playback has already been taken over and must be left alone —
          // pausing it at this point would silence the hover that started it
          if (!audio.muted) return

          audio.pause()
          audio.currentTime = 0
          audio.muted = false
        },
        () => {
          audio.muted = false
        },
      )
    })
  }

  /** The long takes ship with preload="none", so each is fetched while the clip before it plays */
  const warmClip = (index: number) => {
    const audio = audioRefs.current[index]
    if (!audio || audio.preload === "auto") return

    audio.preload = "auto"
    audio.load()
  }

  /** One ring per pulse in the step's score, each starting at the offset that score gives it */
  const runPulses = (pulses: NexgemPulse[]) => {
    const firePulse = ({ kind, ms }: NexgemPulse) => {
      pulseRunRef.current += 1
      const run = pulseRunRef.current
      setRings(current => [...current, { run, kind, ms }])
    }

    pulseTimeoutsRef.current.forEach(id => window.clearTimeout(id))
    pulseTimeoutsRef.current.length = 0
    setRings([])

    pulses.forEach(pulse => {
      if (pulse.at === 0) firePulse(pulse)
      else pulseTimeoutsRef.current.push(window.setTimeout(() => firePulse(pulse), pulse.at))
    })
  }

  // The playlist only moves forward, one step per hover, and only from the group the current step names.
  // While a clip sounds every hover is ignored — nothing is queued, and nothing ever interrupts it
  const handleHoverEnter = (group: NexgemHoverGroup) => {
    if (!isHoverSoundOn || !isSoundOn || isSoundingRef.current || HOVER_SOUND_PLAYLIST.length === 0) return

    // The hint has done its job the moment a hover lands on the right group
    setHasHovered(true)

    // Taken modulo the playlist, because shortening the script while the page is open leaves the counter past
    // the end of it. The throw that caused took the hover handler down with it, so nothing played until a
    // click remounted the card and put the counter back to zero
    const index = stepRef.current % HOVER_SOUND_PLAYLIST.length
    const step = HOVER_SOUND_PLAYLIST[index]
    const audio = audioRefs.current[index]
    if (!step || !audio || step.group !== group) return

    isSoundingRef.current = true

    // The controller doubles as the settled flag: whichever of the two events lands first wins
    const controller = new AbortController()
    const settle = (didFinish: boolean) => {
      if (controller.signal.aborted) return

      controller.abort()
      isSoundingRef.current = false
      if (IS_DEV) setNowPlaying(null)
      if (didFinish) stepRef.current = (index + 1) % HOVER_SOUND_PLAYLIST.length
    }

    audio.addEventListener("ended", () => settle(true), { signal: controller.signal })
    audio.addEventListener("error", () => settle(false), { signal: controller.signal })

    audio.pause()
    audio.currentTime = 0
    // Unmuted explicitly: the unlock pass leaves clips muted while it primes them, and a hover landing in
    // that window would otherwise play a silent clip under a full animation
    audio.muted = false
    audio.volume = HOVER_SOUND_VOLUME

    // The rings run on hover whatever the audio does. Chrome refuses anything audible until the visitor has
    // interacted with the page once, and a visitor who only scrolls and hovers has not — so tying the score
    // to playback left them with a widget that answered nothing. Now the animation always answers the hover,
    // and the sound joins it as soon as the browser allows any
    runPulses(step.pulses)
    if (IS_DEV) setNowPlaying(step.src.slice(1))

    void audio.play()?.then(
      () => warmClip((index + 1) % HOVER_SOUND_PLAYLIST.length),
      () => {
        // Nothing sounded, so no `ended` is coming. The step still finishes on the score's own length,
        // which keeps the ladder moving at the same pace it would with sound
        const scoreMs = step.pulses.reduce((longest, pulse) => Math.max(longest, pulse.at + pulse.ms), 0)
        pulseTimeoutsRef.current.push(window.setTimeout(() => settle(true), scoreMs))
      },
    )
  }

  const handleOuterEnter = () => handleHoverEnter("outer")
  const handleCentreEnter = () => handleHoverEnter("centre")

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07070c]">
      {/* Automation canvas — the dotted board every workflow editor is drawn on, full-bleed behind the graph */}
      <div
        className="absolute [inset:0] opacity-60 [background-image:radial-gradient(hsl(var(--cta)/0.42)_1.7px,transparent_1.8px)] [background-size:34px_34px]"
        aria-hidden="true"
      />
      <div
        className="absolute [inset:0] opacity-70 [background-image:radial-gradient(circle_at_50%_30%,hsl(var(--cta)/0.1),transparent_38%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-secondary-foreground/20 to-transparent"
        aria-hidden="true"
      />

      <svg
        className="absolute inset-x-0 top-0 h-[430px] w-full"
        viewBox="0 0 600 430"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false">
        <defs>
          <linearGradient id="nexgem-node-metal" x1="0" y1="0" x2="112" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2C2733" />
            <stop offset="0.5" stopColor="#15121C" />
            <stop offset="1" stopColor="#0A0810" />
          </linearGradient>
          <linearGradient id="nexgem-node-rim" x1="0" y1="0" x2="112" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--secondary))" stopOpacity="0.34" />
            <stop offset="0.5" stopColor="hsl(var(--cta))" stopOpacity="0.8" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient
            id="nexgem-hub-glow"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(300 130) rotate(90) scale(120)">
            <stop stopColor="hsl(var(--cta))" stopOpacity="0.36" />
            <stop offset="1" stopColor="hsl(var(--cta))" stopOpacity="0" />
          </radialGradient>
          <filter id="nexgem-soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.72" />
          </filter>
        </defs>

        <ellipse cx="300" cy="130" rx="150" ry="120" fill="url(#nexgem-hub-glow)" className="nexgem-hub-breath" />

        {/* Edges: a dim rail plus a short dash that keeps travelling along it */}
        <g strokeLinecap="round">
          <path
            d="M140 68C194 68 190 130 244 130"
            pathLength="100"
            stroke="hsl(var(--cta))"
            strokeOpacity="0.24"
            strokeWidth="2.5"
          />
          <path
            d="M140 192C194 192 190 130 244 130"
            pathLength="100"
            stroke="hsl(var(--cta))"
            strokeOpacity="0.24"
            strokeWidth="2.5"
          />
          <path
            d="M356 130C410 130 406 68 460 68"
            pathLength="100"
            stroke="hsl(var(--cta))"
            strokeOpacity="0.24"
            strokeWidth="2.5"
          />
          <path
            d="M356 130C410 130 406 192 460 192"
            pathLength="100"
            stroke="hsl(var(--cta))"
            strokeOpacity="0.24"
            strokeWidth="2.5"
          />

          <path d="M140 68C194 68 190 130 244 130" pathLength="100" className="nexgem-flow" />
          <path
            d="M140 192C194 192 190 130 244 130"
            pathLength="100"
            className="nexgem-flow"
            style={{ animationDelay: "-1.1s" }}
          />
          <path
            d="M356 130C410 130 406 68 460 68"
            pathLength="100"
            className="nexgem-flow"
            style={{ animationDelay: "-2.2s" }}
          />
          <path
            d="M356 130C410 130 406 192 460 192"
            pathLength="100"
            className="nexgem-flow"
            style={{ animationDelay: "-0.5s" }}
          />
        </g>

        <g filter="url(#nexgem-soft-shadow)">
          {/* Secure auth */}
          <NexgemNode x={28} y={28} pulseDelay="0s" onEnter={handleOuterEnter}>
            <path
              d="M56 8L78 17V38C78 54 68 65 56 70C44 65 34 54 34 38V17L56 8Z"
              fill="hsl(var(--cta))"
              fillOpacity="0.12"
              stroke="#F2EEF8"
              strokeOpacity="0.82"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="56" cy="34" r="6" fill="#F2EEF8" fillOpacity="0.9" />
            <rect x="53.5" y="37" width="5" height="13" rx="2.5" fill="#F2EEF8" fillOpacity="0.9" />
          </NexgemNode>

          {/* Copy-paste snippet — the sheet the client copies out of the platform */}
          <NexgemNode x={28} y={152} pulseDelay="-2.4s" onEnter={handleOuterEnter}>
            <rect
              x="28"
              y="8"
              width="42"
              height="52"
              rx="6"
              fill="hsl(var(--cta))"
              fillOpacity="0.16"
              stroke="#F2EEF8"
              strokeOpacity="0.62"
              strokeWidth="2.5"
            />
            <rect
              x="42"
              y="20"
              width="42"
              height="52"
              rx="6"
              fill="#15121C"
              stroke="#F2EEF8"
              strokeOpacity="0.85"
              strokeWidth="2.5"
            />
            <path
              d="M50 34H76M50 44H76M50 54H66"
              stroke="#F2EEF8"
              strokeOpacity="0.72"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </NexgemNode>

          {/* n8n orchestration hub */}
          <NexgemNode x={244} y={90} pulseDelay="-1.2s" onEnter={handleCentreEnter}>
            {/* One ring per sound: `req` contracts into the hub, `resp` swells away from it. Each clears
                itself once it has finished travelling, so overlapping sounds simply overlap on screen */}
            {rings.map(ring => (
              <rect
                key={ring.run}
                className={ring.kind === "in" ? "nexgem-pulse-in" : "nexgem-pulse-out"}
                style={{ animationDuration: `${ring.ms}ms` }}
                onAnimationEnd={() => setRings(current => current.filter(other => other.run !== ring.run))}
                x="-4"
                y="-4"
                width="120"
                height="88"
                rx="16"
              />
            ))}
            <path
              d="M43 40L66 26M43 40L66 54"
              stroke="#F2EEF8"
              strokeOpacity="0.72"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="34"
              cy="40"
              r="9"
              fill="hsl(var(--cta))"
              stroke="#F2EEF8"
              strokeOpacity="0.85"
              strokeWidth="2"
            />
            <circle cx="74" cy="24" r="8" fill="#0F0C15" stroke="#F2EEF8" strokeOpacity="0.85" strokeWidth="2" />
            <circle cx="74" cy="56" r="8" fill="#0F0C15" stroke="#F2EEF8" strokeOpacity="0.85" strokeWidth="2" />
          </NexgemNode>

          {/* Chatbot automation */}
          <NexgemNode x={460} y={28} pulseDelay="-3.1s" onEnter={handleOuterEnter}>
            <path
              d="M32 14H80C85 14 88 17 88 22V44C88 49 85 52 80 52H54L40 64V52H32C27 52 24 49 24 44V22C24 17 27 14 32 14Z"
              fill="hsl(var(--cta))"
              fillOpacity="0.12"
              stroke="#F2EEF8"
              strokeOpacity="0.82"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="40" cy="33" r="4" fill="#F2EEF8" fillOpacity="0.85" />
            <circle cx="56" cy="33" r="4" fill="#F2EEF8" fillOpacity="0.85" />
            <circle cx="72" cy="33" r="4" fill="#F2EEF8" fillOpacity="0.85" />
          </NexgemNode>

          {/* The client site once the snippet is pasted — the docked widget types, then answers */}
          <NexgemNode x={460} y={152} pulseDelay="-1.8s" onEnter={handleOuterEnter}>
            <rect
              x="20"
              y="12"
              width="72"
              height="56"
              rx="5"
              fill="hsl(var(--cta))"
              fillOpacity="0.1"
              stroke="#F2EEF8"
              strokeOpacity="0.82"
              strokeWidth="2.5"
            />
            <path d="M20 27H92" stroke="#F2EEF8" strokeOpacity="0.6" strokeWidth="2" />
            <circle cx="29" cy="19.5" r="2.5" fill="#F2EEF8" fillOpacity="0.7" />
            <circle cx="37" cy="19.5" r="2.5" fill="#F2EEF8" fillOpacity="0.7" />
            <circle cx="45" cy="19.5" r="2.5" fill="#F2EEF8" fillOpacity="0.7" />
            <path d="M27 36H45M27 44H40" stroke="#F2EEF8" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
            <rect
              x="48"
              y="32"
              width="42"
              height="34"
              rx="7"
              fill="hsl(var(--cta))"
              fillOpacity="0.92"
              stroke="#F2EEF8"
              strokeOpacity="0.85"
              strokeWidth="2.5"
            />
            <g key={replyRun} stroke="#0B0A12" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round">
              <circle className="nexgem-typing-dot" cx="69" cy="49" r="3.2" fill="#0B0A12" stroke="none" />
              <path className="nexgem-reply-line" style={{ animationDelay: "4s" }} d="M55 42H83" pathLength="100" />
              <path className="nexgem-reply-line" style={{ animationDelay: "4.65s" }} d="M55 50H79" pathLength="100" />
              <path className="nexgem-reply-line" style={{ animationDelay: "5.3s" }} d="M55 58H72" pathLength="100" />
            </g>
          </NexgemNode>
        </g>
      </svg>

      <div
        className="pointer-events-none absolute z-30 bg-gradient-to-t from-[#07070c] via-[#07070c]/95 to-transparent px-lg pb-lg pt-[90px] text-center"
        style={{ right: 0, bottom: 0, left: 0 }}>
        <div className="mx-auto max-w-[720px]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cta">{t("badge")}</p>
          <h2 className="mt-sm text-lg font-bold tracking-tight text-secondary">{t("title")}</h2>
          <p className="mx-auto mt-sm max-w-[500px] text-sm leading-relaxed text-secondary-foreground/60">
            {t("description")}
          </p>
          <div className="mt-md flex items-center justify-center gap-x-lg text-[11px] font-medium uppercase tracking-[0.08em] text-secondary-foreground/30">
            <span className="inline-flex items-center gap-x-[6px]">
              <FiShield className="h-3 w-3 text-cta/40" aria-hidden="true" />
              {t("secureAuth")}
            </span>
            <span className="inline-flex items-center gap-x-[6px]">
              <FiCode className="h-3 w-3 text-cta/40" aria-hidden="true" />
              {t("embedWidget")}
            </span>
          </div>
        </div>
      </div>

      {/* Browsers keep sound off until the visitor has interacted, so the widget asks for that interaction
          rather than staying quietly broken. Once it is given, the prompt turns into a nudge toward the
          icons, and that clears itself on the first hover that lands */}
      {isHoverSoundOn && !hasHovered && (
        <div className="absolute z-40 flex justify-center" style={{ right: 0, top: 12, left: 0 }}>
          {isSoundOn ? (
            <span className="nexgem-hint rounded-full bg-black/70 px-md py-sm text-xs font-medium tracking-wide text-secondary ring-1 ring-cta/40">
              {t("hoverHere")}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleTurnOnSound}
              className="inline-flex items-center gap-x-sm rounded-full bg-black/70 px-md py-sm text-xs font-medium tracking-wide text-secondary ring-1 ring-cta/40 transition-colors hover:bg-black/85 hover:text-cta">
              {t("turnOnSound")}
              <FiVolume2 className="h-3.5 w-3.5 text-cta" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {IS_DEV && nowPlaying && (
        <p
          className="pointer-events-none absolute z-40 rounded-md bg-black/85 px-sm py-[5px] font-mono text-[11px] leading-none text-cta ring-1 ring-cta/30"
          style={{ right: 8, bottom: 8 }}>
          {nowPlaying}
        </p>
      )}

      {isHoverSoundOn &&
        HOVER_SOUND_PLAYLIST.map((step, index) => (
          <audio
            key={step.src}
            ref={element => {
              audioRefs.current[index] = element
            }}
            src={step.src}
            preload={index < EAGER_CLIP_COUNT ? "auto" : "none"}
          />
        ))}
    </div>
  )
}
