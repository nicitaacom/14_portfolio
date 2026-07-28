interface LoadingSpinnerProps {
  strokeWidth?: number
}

export function LoadingSpinner({ strokeWidth = 2 }: LoadingSpinnerProps) {
  return (
    <svg className="h-[32px] w-[52px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 78 42" aria-label="Loading">
      <defs>
        <linearGradient id="gear-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="hsl(var(--paper))" />
          <stop offset="0.42" stopColor="hsl(var(--brass))" />
          <stop offset="1" stopColor="hsl(var(--steel-deep))" />
        </linearGradient>
      </defs>
      <g className="gearset" transform="translate(39 21)">
        <path d="M-6-18H6L8-13L13-14L17-8L14-4L18 1L14 6L17 11L11 16L6 13L1 18L-5 14L-10 17L-16 11L-13 6L-18 1L-14-5L-17-10L-11-16L-6-13Z" fill="url(#gear-metal)" stroke="hsl(var(--steel-deep))" strokeWidth={strokeWidth} />
        <circle r="7" fill="hsl(var(--steel-deep))" stroke="hsl(var(--paper) / 0.45)" />
      </g>
      <g className="gearset-reverse" transform="translate(16 29)">
        <path d="M-4-11H4L5-8L8-9L11-4L8-2L11 2L8 5L9 8L4 11L2 8L-2 11L-6 8L-5 5L-10 2L-8-2L-10-5L-6-9L-4-8Z" fill="url(#gear-metal)" stroke="hsl(var(--steel-deep))" strokeWidth={strokeWidth} />
        <circle r="4" fill="hsl(var(--steel-deep))" />
      </g>
      <g className="gearset-reverse" transform="translate(63 29)">
        <path d="M-4-11H4L5-8L8-9L11-4L8-2L11 2L8 5L9 8L4 11L2 8L-2 11L-6 8L-5 5L-10 2L-8-2L-10-5L-6-9L-4-8Z" fill="url(#gear-metal)" stroke="hsl(var(--steel-deep))" strokeWidth={strokeWidth} />
        <circle r="4" fill="hsl(var(--steel-deep))" />
      </g>
    </svg>
  )
}
