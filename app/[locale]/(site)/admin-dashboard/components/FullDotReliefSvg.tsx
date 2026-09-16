"use client"

import { useEffect, useId, useState } from "react"

type Size = { width: number; height: number }

/** A viewport-sized vector stud field. SVG keeps each dot crisp without a repeating raster tile. */
export function FullDotReliefSvg() {
  const id = useId().replaceAll(":", "")
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const step = 9.4
  const columns = Math.ceil(size.width / step) + 2
  const rows = Math.ceil(size.height / step) + 2

  return <svg className="h-full w-full" viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} aria-hidden="true" focusable="false">
    <defs><radialGradient id={id} cx="28%" cy="23%" r="78%">
      <stop offset="0" stopColor="var(--3d-dot-c-f2f6f8)" /><stop offset="0.25" stopColor="var(--3d-dot-c-a2adb4)" />
      <stop offset="0.62" stopColor="var(--3d-dot-c-4c565d)" /><stop offset="1" stopColor="var(--3d-dot-c-15191c)" />
    </radialGradient></defs>
    {Array.from({ length: rows * columns }, (_, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const wave = (Math.sin(column * 0.065 + Math.sin(row * 0.043) * 2.7) + 1) / 2
      const verticalWave = (Math.cos(row * 0.052 + column * 0.021) + 1) / 2
      const relief = wave * 0.72 + verticalWave * 0.28
      const x = column * step + Math.sin(row * 0.19) * 0.75
      const y = row * step + Math.sin(column * 0.12) * 0.55 - relief * 1.7
      const radius = 0.7 + relief * 1.55
      return <g key={index} opacity={(0.24 + relief * 0.76).toFixed(3)}>
        <circle cx={(x + radius * 0.45).toFixed(3)} cy={(y + radius * 0.6).toFixed(3)} r={(radius + 0.35).toFixed(3)} fill="var(--3d-dot-c-050708)" opacity="0.72" />
        <circle cx={x.toFixed(3)} cy={y.toFixed(3)} r={radius.toFixed(3)} fill={`url(#${id})`} />
      </g>
    })}
  </svg>
}
