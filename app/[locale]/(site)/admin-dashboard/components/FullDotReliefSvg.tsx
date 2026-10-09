"use client"

import { Fragment, memo, useEffect, useId, useMemo, useRef, useState } from "react"

const scale = 1.2
const stepX = 8.5 * scale
const stepY = 8.4 * scale
const attribute = (value: number) => value.toFixed(3)

/** One native SVG stud field with continuous lighting; no repeated vignette tiles or square seams. */
export const FullDotReliefSvg = memo(function FullDotReliefSvg() {
  const svg = useRef<SVGSVGElement>(null)
  const gradientId = useId().replaceAll(":", "")
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = svg.current
    if (!element) return
    let frame = 0
    const measure = () => {
      const width = Math.ceil(element.clientWidth)
      const height = Math.ceil(element.clientHeight)
      setSize(previous => previous.width === width && previous.height === height ? previous : { width, height })
    }
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    })
    observer.observe(element)
    measure()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const dots = useMemo(() => {
    if (!size.width || !size.height) return null
    const columns = Math.ceil(size.width / stepX) + 2
    const rows = Math.ceil(size.height / stepY) + 2
    return Array.from({ length: rows * columns }, (_, index) => {
      const col = index % columns - 1
      const row = Math.floor(index / columns) - 1
      // Broad, overlapping waves span the wall instead of restarting at each tile edge.
      const relief = (Math.sin(col * 0.037 + Math.sin(row * 0.029) * 2.1) + Math.cos(row * 0.041 - col * 0.014) * 0.35 + 1.35) / 2.7
      const radius = (1.1 + relief * 1.6) * scale
      const x = 6 * scale + col * stepX
      const y = 7 * scale + row * stepY - relief * 4 * scale
      const light = 0.32 + relief * 0.55
      // Fill alpha preserves the lighting without creating a compositing group for every stud.
      return <Fragment key={`${col}:${row}`}>
        <circle cx={attribute(x + 0.8 * scale)} cy={attribute(y + 1.5 * scale)} r={attribute(radius + 0.35 * scale)} fill="var(--3d-dot-c-060809)" fillOpacity={attribute(light * 0.8)} />
        <circle cx={attribute(x)} cy={attribute(y)} r={attribute(radius)} fill={`url(#${gradientId})`} fillOpacity={attribute(light)} />
      </Fragment>
    })
  }, [gradientId, size])

  return <div className="admin-metal-wall h-full w-full" aria-hidden="true"><svg ref={svg} className="block h-full w-full" focusable="false">
    <defs><radialGradient id={gradientId} cx="30%" cy="22%" r="78%">
      <stop offset="0" stopColor="var(--3d-dot-c-c2c7ca)" /><stop offset="0.24" stopColor="var(--3d-dot-c-72797d)" />
      <stop offset="0.62" stopColor="var(--3d-dot-c-383d41)" /><stop offset="1" stopColor="var(--3d-dot-c-141719)" />
    </radialGradient></defs>
    {dots}
  </svg></div>
})
