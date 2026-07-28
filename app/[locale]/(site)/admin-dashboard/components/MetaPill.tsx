"use client"

export function MetaPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[2px] border border-brass/40 bg-steel px-sm py-[2px] text-xs ${className}`}>
      {children}
    </span>
  )
}
