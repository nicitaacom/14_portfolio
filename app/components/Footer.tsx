"use client"

import { PiTelegramLogoBold } from "react-icons/pi"
import { RiDiscordLine } from "react-icons/ri"
import { AiFillLinkedin } from "react-icons/ai"
import { BsFiletypePdf } from "react-icons/bs"
import { GrSchedule } from "react-icons/gr"

import { Button } from "./Button"
import { useScopedI18n } from "@/locales/client"

/* Slices run the length of the rail and the one whole fruit closes it on the right, so the row
   reads as a mandarin that has been cut rather than a repeated sticker. `mandarine` appears
   exactly once and stays last for that reason */
const FOOTER_ORNAMENT_PATTERN = [
  "slice",
  "candle",
  "slice",
  "slice",
  "candle",
  "slice",
  "slice",
  "candle",
  "slice",
  "slice",
  "candle",
  "slice",
  "slice",
  "candle",
  "slice",
  "mandarine",
] as const

/* A slice's angle comes from its position rather than Math.random(): the server and the browser
   both render this markup, and a value drawn at render time would differ between the two and
   fail hydration. 47 and 61 share no factor, so stepping through the positions walks the whole
   -30..30 range instead of settling into a short repeating run of similar angles */
function sliceTilt(index: number) {
  return ((index * 47) % 61) - 30
}

/* A negative delay starts a candle partway through its flicker, so the row is already out of
   step on the first frame rather than lighting in unison and drifting apart later. Derived from
   the position for the same reason the tilt is: both ends of the render have to agree */
function candlePhase(index: number) {
  return `-${(((index * 29) % 37) / 10).toFixed(2)}s`
}

export function Footer() {
  const t = useScopedI18n("common")

  return (
    <footer className="site-footer relative mb-lg mt-auto">
      <div className="new-year-footer-ornaments" aria-hidden="true">
        {FOOTER_ORNAMENT_PATTERN.map((ornament, index) => (
          <span
            key={`${ornament}-${index}`}
            className={`new-year-footer-ornament new-year-footer-${ornament}`}
            style={
              ornament === "slice"
                ? ({ "--ornament-tilt": `${sliceTilt(index)}deg` } as React.CSSProperties)
                : ornament === "candle"
                  ? ({ "--candle-offset": candlePhase(index) } as React.CSSProperties)
                  : undefined
            }
          />
        ))}
      </div>
      <div className="site-footer-controls relative mx-auto grid max-w-[80vw] grid-cols-2 justify-center gap-x-md gap-y-md min-[882px]:flex">
        <Button href="https://t.me/nicitaacom" target="_blank">
          {t("telegram")} <PiTelegramLogoBold />
        </Button>
        <Button href="https://discord.com/users/780002958380498955" target="_blank">
          {t("discord")} <RiDiscordLine />
        </Button>
        <Button href="https://linkedin.com/in/nicitaacom" target="_blank">
          {t("linkedIn")} <AiFillLinkedin />
        </Button>
        <Button
          href="https://drive.google.com/file/d/1FmubKhYXUM8TmdqXHe5cxRBWKdPObxQN/view?usp=sharing"
          target="_blank">
          {t("summaryEn")} <BsFiletypePdf />
        </Button>
        <Button
          href="https://drive.google.com/file/d/1VUT58x-nLDb2-zmfWLvi7RiFiqESJcx3/view?usp=sharing"
          target="_blank">
          {t("summaryDe")} <BsFiletypePdf />
        </Button>
        <Button className="text-center col-span-2" href="/appointment">
          {t("bookAppointment")} <GrSchedule />
        </Button>
      </div>
    </footer>
  )
}
