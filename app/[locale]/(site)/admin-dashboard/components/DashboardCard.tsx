"use client"

export function DashboardCard({
  children,
  subtitle,
  className = "",
  title,
}: {
  children: React.ReactNode
  className?: string
  subtitle?: string
  title: string
}) {
  return (
    <section
      className={`rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="mb-[4px] flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{title}</h2>
        {subtitle && <p className="text-xs">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
