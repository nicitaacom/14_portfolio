"use client"

import { useSiteTheme } from "@/hooks/useSiteTheme"

/* Six of the reference photographs, ordered for rhythm rather than by number: a warm close-up, a
   portrait, the group shot, then two wide outdoor frames and the frost texture to close. */
const STRIP_FRAMES = [
  { src: "/UI/new-year/references/new-year-23.jpg", focus: "50% 45%" },
  { src: "/UI/new-year/references/new-year-41.jpg", focus: "50% 30%" },
  { src: "/UI/new-year/references/new-year-24.jpg", focus: "50% 35%" },
  { src: "/UI/new-year/references/new-year-37.jpg", focus: "50% 55%" },
  { src: "/UI/new-year/references/new-year-36.jpeg", focus: "50% 50%" },
  { src: "/UI/new-year/references/new-year-30.jpg", focus: "50% 50%" },
]

export function NewYearFilmStrip() {
  const theme = useSiteTheme()

  if (theme !== "new-year") return null

  return (
    <div className="new-year-film-strip" aria-hidden="true">
      {STRIP_FRAMES.map(frame => (
        <figure key={frame.src} className="new-year-film-slice">
          {/* A element rather than next/image on purpose. Inside these skewed, clipped panels the
              optimiser issued requests for only three of the six frames — the other three kept a
              valid srcset and a real layout box and were simply never fetched. These are six fixed
              decorative photographs, so the optimiser buys little and the direct tag is reliable. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frame.src}
            alt=""
            className="new-year-film-photo"
            style={{ objectPosition: frame.focus }}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  )
}
