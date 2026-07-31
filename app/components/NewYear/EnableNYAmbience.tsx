"use client"

import { useEffect, useRef } from "react"

import { useSiteTheme } from "@/hooks/useSiteTheme"
import { useScopedI18n } from "@/locales/client"
import { useNewYearAmbience } from "@/store/useNewYearAmbience"

/* Sixteen minutes of recorded ambience, and most visitors never ask for it — `preload="none"`
   keeps all of it off the wire until the button is pressed. Anything else would spend 15MB on
   every visit for a sound nobody switched on */
const AMBIENCE_SRC = "/new-year-WOT-angar-fireworks-ambience.mp3"

/* Far enough back to sit under everything else on the page. This is a room tone, not a track */
const AMBIENCE_VOLUME = 0.34
const FADE_STEP = 0.02
const FADE_TICK_MS = 40

export function EnableNYAmbience() {
  const theme = useSiteTheme()
  const t = useScopedI18n("common")
  const { isAmbienceOn, setIsAmbienceOn } = useNewYearAmbience()
  const audioRef = useRef<HTMLAudioElement>(null)

  /* Faded rather than cut. A sixteen minute recording of a distant crowd starting at full level
     the instant a button is pressed reads as a glitch; arriving over half a second reads as a
     window being opened. The same fade runs in reverse on the way out, and the element is only
     paused once it is silent */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let fadeTimer: ReturnType<typeof setInterval> | undefined

    const stopFade = () => {
      if (fadeTimer) clearInterval(fadeTimer)
      fadeTimer = undefined
    }

    if (isAmbienceOn) {
      audio.volume = 0
      /* A visitor who has not interacted with the page yet has their play request rejected by
         the browser. That is expected rather than broken, so the toggle is put back to off and
         the button reads as untouched */
      void audio
        .play()
        .then(() => {
          fadeTimer = setInterval(() => {
            audio.volume = Math.min(AMBIENCE_VOLUME, audio.volume + FADE_STEP)
            if (audio.volume >= AMBIENCE_VOLUME) stopFade()
          }, FADE_TICK_MS)
        })
        .catch(() => setIsAmbienceOn(false))
    } else if (!audio.paused) {
      fadeTimer = setInterval(() => {
        audio.volume = Math.max(0, audio.volume - FADE_STEP)
        if (audio.volume > 0) return

        stopFade()
        audio.pause()
      }, FADE_TICK_MS)
    }

    return stopFade
  }, [isAmbienceOn, setIsAmbienceOn])

  /* The loop attribute on the element is what normally restarts the track, and it never fires
     `ended` while it works. This is the backstop for when it does not: a sixteen minute file
     fetched in pieces rather than whole can reach its end before the seek back to the start is
     possible, and a browser that gives up there leaves the button lit over silence. Seeking to
     zero and playing again covers that, and costs nothing on the runs where `loop` did its job */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const restart = () => {
      audio.currentTime = 0
      void audio.play().catch(() => setIsAmbienceOn(false))
    }

    audio.addEventListener("ended", restart)
    return () => audio.removeEventListener("ended", restart)
  }, [setIsAmbienceOn])

  /* Leaving the theme takes the sound with it, so a visitor who switches away is not left with
     a soundtrack playing over a page that has no fireworks in it */
  useEffect(() => {
    if (theme !== "new-year") setIsAmbienceOn(false)
  }, [theme, setIsAmbienceOn])

  if (theme !== "new-year") return null

  return (
    /* The wording stays put and aria-pressed states whether it is on, which is the toggle-button
       pattern: a label that swaps to "Disable" is ambiguous read on its own, because it names
       what pressing does rather than what is happening. The lit shell and the pressed styling
       show the state. The text is the button's accessible name, so no aria-label is set over
       the top of it */
    <button
      type="button"
      className="new-year-ambience-toggle"
      aria-pressed={isAmbienceOn}
      onClick={() => setIsAmbienceOn(!isAmbienceOn)}>
      <span className="new-year-ambience-toggle-burst" aria-hidden="true" />
      <span className="new-year-ambience-toggle-label">{t("enableAmbience")}</span>
      <audio ref={audioRef} src={AMBIENCE_SRC} preload="none" loop />
    </button>
  )
}
