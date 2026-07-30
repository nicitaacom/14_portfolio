"use client"

import { useSiteTheme } from "@/hooks/useSiteTheme"

interface StripFrame {
  src: string
  focus: string
}

const REFERENCE_DIRECTORY = "/UI/new-year/references"

/* Each set is ordered for rhythm rather than by number, so a close-up never sits next to another
   close-up and the wide frames are spread across the row. */
const FRAME_SETS: Record<"home" | "appointment", StripFrame[]> = {
  /* Outdoors and people: cocoa, the hat portrait, the group, a snowball fight, skiing, frost */
  home: [
    { src: `${REFERENCE_DIRECTORY}/new-year-23.jpg`, focus: "50% 45%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-41.jpg`, focus: "50% 30%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-24.jpg`, focus: "50% 35%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-37.jpg`, focus: "50% 55%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-36.jpeg`, focus: "50% 50%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-30.jpg`, focus: "50% 50%" },
  ],
  /* Indoors and treats, which suits a page about booking a time to talk: the fireplace, holiday
     coffee, chocolate on a windowsill, mandarins, the tableware and a tartan room */
  appointment: [
    { src: `${REFERENCE_DIRECTORY}/new-year-21.jpg`, focus: "50% 50%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-14.jpg`, focus: "50% 45%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-16.jpg`, focus: "50% 55%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-3.jpg`, focus: "50% 55%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-19.jpg`, focus: "50% 45%" },
    { src: `${REFERENCE_DIRECTORY}/new-year-9.jpg`, focus: "50% 40%" },
  ],
}

interface NewYearFilmStripProps {
  variant?: keyof typeof FRAME_SETS
}

export function NewYearFilmStrip({ variant = "home" }: NewYearFilmStripProps) {
  const theme = useSiteTheme()

  if (theme !== "new-year") return null

  return (
    <div className="new-year-film-strip" aria-hidden="true">
      {FRAME_SETS[variant].map(frame => (
        <figure key={frame.src} className="new-year-film-slice">
          {/* A direct tag rather than next/image on purpose. Inside these skewed, clipped panels the
              optimiser issued requests for only three of the six frames — the other three kept a
              valid srcset and a real layout box and were simply never fetched. These are fixed
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
