import { useId } from "react"

function ReliefDots({ gradientId }: { gradientId: string }) {
  return <>{Array.from({ length: 34 * 35 }, (_, index) => {
    const col = index % 35
    const row = Math.floor(index / 35)
    const ridge = (Math.sin(col * 0.17 + Math.sin(row * 0.14) * 2.5) + 1) / 2
    const fade = Math.sin(col / 34 * Math.PI) * Math.sin(row / 33 * Math.PI)
    const r = 1.1 + ridge * 1.6
    const x = 6 + col * 8.5
    const y = 7 + row * 8.4 - ridge * 4
    const attribute = (value: number) => value.toFixed(3)
    return <g key={index} opacity={attribute(0.15 + fade * 0.85)}>
      <circle cx={attribute(x + 0.8)} cy={attribute(y + 1.5)} r={attribute(r + 0.35)} fill="var(--3d-dot-c-060809)" opacity="0.8" />
      <circle cx={attribute(x)} cy={attribute(y)} r={attribute(r)} fill={`url(#${gradientId})`} />
    </g>
  })}</>
}

function ReliefGradient({ id }: { id: string }) {
  return <radialGradient id={id} cx="30%" cy="22%" r="78%">
    <stop offset="0" stopColor="var(--3d-dot-c-c2c7ca)" /><stop offset="0.24" stopColor="var(--3d-dot-c-72797d)" />
    <stop offset="0.62" stopColor="var(--3d-dot-c-383d41)" /><stop offset="1" stopColor="var(--3d-dot-c-141719)" />
  </radialGradient>
}

/** A lit surface of small metal studs; changing relief creates a wave in the plate. */
export function DotRelief({ className = "block w-full" }: { className?: string }) {
  const id = useId().replaceAll(":", "")
  return <svg className={className} viewBox="0 0 300 290" aria-hidden="true" focusable="false">
    <defs><ReliefGradient id={id} /></defs>
    <ReliefDots gradientId={id} />
  </svg>
}

/** Repeats the same native-size relief tile across a viewport without scaling its studs. */
export function DotReliefBackground({ className = "h-full w-full", scale = 1.2 }: { className?: string; scale?: number }) {
  const id = useId().replaceAll(":", "")
  const dotsId = `${id}-dots`
  const patternId = `${id}-pattern`
  return <svg className={className} aria-hidden="true" focusable="false">
    <defs>
      <ReliefGradient id={id} />
      <g id={dotsId}><ReliefDots gradientId={id} /></g>
      <pattern id={patternId} width={300 * scale} height={290 * scale} patternUnits="userSpaceOnUse"><use href={`#${dotsId}`} transform={`scale(${scale})`} /></pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
  </svg>
}
