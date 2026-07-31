"use client"

import Image from "next/image"

import { useSiteTheme } from "@/hooks/useSiteTheme"

export function NewYearAppointmentStillLife() {
  const theme = useSiteTheme()

  if (theme !== "new-year") return null

  return (
    <div className="new-year-appointment-still-life" aria-hidden="true">
      <div className="new-year-appointment-window">
        <span className="new-year-appointment-window-star new-year-appointment-window-star-one" />
        <span className="new-year-appointment-window-star new-year-appointment-window-star-two" />
        <span className="new-year-appointment-window-star new-year-appointment-window-star-three" />
      </div>
      <div className="new-year-appointment-table">
        <Image
          className="new-year-appointment-gifts"
          src="/UI/new-year/new-year-gifts.png"
          alt=""
          width={675}
          height={1200}
          sizes="180px"
        />
        <Image
          className="new-year-appointment-coffee"
          src="/UI/new-year/cinnamon-roll-with-coffee.png"
          alt=""
          width={736}
          height={676}
          sizes="220px"
        />
        <Image
          className="new-year-appointment-mandarins"
          src="/UI/new-year/new-year-mandarines.png"
          alt=""
          width={2121}
          height={1414}
          sizes="230px"
        />
        <span className="new-year-appointment-candle" />
      </div>
    </div>
  )
}
