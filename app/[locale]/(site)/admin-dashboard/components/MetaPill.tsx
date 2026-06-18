"use client"

export function MetaPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[2px] border border-[#3a3a3a] bg-[#262626] px-sm py-[2px] text-xs ${className}`}>
      {children}
    </span>
  )
}
