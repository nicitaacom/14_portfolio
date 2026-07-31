"use client"

import { useSiteTheme } from "@/hooks/useSiteTheme"

export function NewYearModalStillLife() {
  const theme = useSiteTheme()

  if (theme !== "new-year") return null

  return (
    <div className="new-year-modal-still-life" aria-hidden="true">
      {/* Fixed decorative cutouts rendered at small CSS-constrained sizes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="new-year-modal-socks" src="/UI/new-year/new-year-socks.png" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="new-year-modal-coffee" src="/UI/new-year/cinnamon-roll-with-coffee.png" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="new-year-modal-mandarins" src="/UI/new-year/new-year-mandarines.png" alt="" />
    </div>
  )
}
