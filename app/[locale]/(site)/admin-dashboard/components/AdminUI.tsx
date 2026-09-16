"use client"

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"
import { FiRefreshCw } from "react-icons/fi"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { DotReliefBackground } from "./DotRelief"

export type DisplayPeriod = { start: string; end: string; bucketUnit: "day" | "month"; timezone: "UTC" }

export const adminUi = {
  stack: "flex min-w-0 flex-col gap-sm",
  panel: "relative isolate min-w-0 overflow-hidden rounded-lg border border-[var(--3d-dot-c-383e43)] bg-[linear-gradient(120deg,var(--3d-dot-c-23272a),var(--3d-dot-c-202427-55),var(--3d-dot-c-1e2225))] !px-xs !py-xs shadow-[inset_0_1px_0_var(--3d-dot-c-ffffff0a),0_3px_5px_var(--3d-dot-c-0003)] tablet:!p-sm",
  panelHeader: "mb-xs flex flex-wrap items-center justify-between gap-xs",
  heading: "flex items-center gap-xs text-[13px] font-medium text-[var(--3d-dot-c-e2e7eb)]",
  muted: "text-[var(--3d-dot-c-a1a7ae)]",
  eyebrow: "font-typewriter text-[10px] uppercase tracking-[1.7px] text-[var(--3d-dot-c-a1a7ae)]",
  toolbar: "flex flex-wrap items-center justify-between gap-xs",
  segmented: "inline-flex flex-wrap gap-sm rounded-md border border-[var(--3d-dot-c-343b40)] bg-[var(--3d-dot-c-131719)] shadow-[inset_0_1px_3px_var(--3d-dot-c-0009)] [&>button]:min-h-[34px] [&>button]:flex-1 [&>button]:rounded-[4px] [&>button]:border [&>button]:border-transparent [&>button]:text-[11px] [&>button]:text-[var(--3d-dot-c-9fa8af)] [&>button:hover]:text-[var(--3d-dot-c-eff3f5)] [&>button[aria-pressed=true]]:border-[var(--3d-dot-c-515a63)] [&>button[aria-pressed=true]]:bg-[linear-gradient(var(--3d-dot-c-343b41),var(--3d-dot-c-2a3035))] [&>button[aria-pressed=true]]:text-[var(--3d-dot-c-f2f4f5)]",
  button: "inline-flex min-h-10 items-center justify-center gap-xs rounded-[5px] border border-[var(--3d-dot-c-4b535b)] bg-[linear-gradient(var(--3d-dot-c-333a40),var(--3d-dot-c-292f34))] px-sm py-xs text-[11px] text-[var(--3d-dot-c-dce2e7)] shadow-[inset_0_1px_0_var(--3d-dot-c-ffffff12),0_2px_3px_var(--3d-dot-c-0007)] transition hover:border-[var(--3d-dot-c-85919a)] hover:bg-[linear-gradient(var(--3d-dot-c-3c444c),var(--3d-dot-c-30383f))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--3d-dot-c-e8edf1)] disabled:cursor-wait disabled:opacity-50",
  input: "min-h-[42px] w-full min-w-0 rounded-[5px] border border-[var(--3d-dot-c-4b535a)] bg-[var(--3d-dot-c-171b1e)] px-sm py-xs text-[12px] text-[var(--3d-dot-c-e8ecef)] shadow-[inset_0_2px_3px_var(--3d-dot-c-0008)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--3d-dot-c-e8edf1)]",
  field: "grid min-w-0 gap-xs text-[11px] text-[var(--3d-dot-c-adb5bc)]",
  metrics: "grid grid-cols-2 overflow-hidden rounded-lg border border-[var(--3d-dot-c-383f45)] bg-[var(--3d-dot-c-383f45)] shadow-[0_3px_5px_var(--3d-dot-c-0003)] tablet:grid-cols-3 laptop:grid-cols-4 [&>div]:relative [&>div]:isolate [&>div]:min-w-0 [&>div]:overflow-hidden [&>div]:bg-[linear-gradient(120deg,var(--3d-dot-c-252a2e),var(--3d-dot-c-202528))] [&>div]:!px-xs [&>div]:!py-xs [&>div]:shadow-[inset_0_1px_0_var(--3d-dot-c-ffffff0b)]",
  mono: "font-typewriter font-variant-numeric-tabular-nums",
  badge: "inline-flex w-fit items-center rounded border border-[var(--3d-dot-c-45525d)] bg-[var(--3d-dot-c-202930)] px-xs py-xs font-typewriter text-[9px] leading-4 text-[var(--3d-dot-c-b7c4cf)]",
  error: "rounded-[5px] border border-[var(--3d-dot-c-6a4847)] bg-[var(--3d-dot-c-322526)] px-sm py-sm text-[12px] text-[var(--3d-dot-c-e7b6b0)]",
  empty: "py-md text-[12px] text-[var(--3d-dot-c-a5b1ba)]",
  skeleton: "animate-pulse rounded-lg bg-[linear-gradient(110deg,var(--3d-dot-c-242c32-30),var(--3d-dot-c-303b44-50),var(--3d-dot-c-242c32-70))] bg-[length:250%_100%]",
  chart: "relative mt-xs min-w-0",
  count: "rounded border border-[var(--3d-dot-c-3c4650)] px-xs py-xs text-[10px] text-[var(--3d-dot-c-8e9ba6)]",
}

export function Metric({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return <div className="!px-xs !py-xs"><PanelRelief /><div className="relative"><dt className="font-typewriter text-[9px] uppercase tracking-[.8px] text-[var(--3d-dot-c-a8b1b9)]">{label}</dt><dd className="mt-0 [overflow-wrap:anywhere] text-[22px] font-normal leading-tight tracking-[-.7px] text-[var(--3d-dot-c-eff3f6)] tablet:text-[25px]">{value}</dd>{detail ? <small className="mt-0 block text-[9px] leading-tight text-[var(--3d-dot-c-98a3ab)]">{detail}</small> : null}</div></div>
}

export function PanelRelief() {
  return <div className="pointer-events-none absolute inset-0 box-border p-xs opacity-[0.24] tablet:p-sm" aria-hidden="true"><DotReliefBackground scale={0.62} /></div>
}

export function RefreshButton({ pending, onClick }: { pending: boolean; onClick: () => void }) {
  const t = useScopedI18n("adminConsole")
  return <button className={`${adminUi.button} !inline-flex !shrink-0 !px-sm !py-xs whitespace-nowrap`} type="button" disabled={pending} onClick={onClick}>
    <FiRefreshCw size={14} className={pending ? "animate-spin" : ""} aria-hidden="true" />
    {pending ? t("refreshing") : t("refresh")}
  </button>
}

export function PeriodLabel({ period }: { period: DisplayPeriod | null }) {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const intlLocale = locale === "ua" ? "uk" : locale
  if (!period) return null
  const date = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  const time = new Intl.DateTimeFormat(intlLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" })
  return <div className="mt-xs flex flex-wrap items-center gap-xs font-typewriter text-[10px]">
    <span>{date.format(new Date(period.start))} — {date.format(new Date(period.end))} <span className={adminUi.badge}>{t("utc")}</span></span>
    <span className={adminUi.muted}>{t("updated", { time: time.format(new Date(period.end)) })}</span>
  </div>
}

export function LoadError({ stale = false }: { stale?: boolean }) {
  const t = useScopedI18n("adminConsole")
  return <div className={adminUi.error} role="alert">{t("loadFailed")}{stale && <span> {t("staleData")}</span>}</div>
}

export function AnalyticsSkeleton() {
  const t = useScopedI18n("adminConsole")
  return <div className={adminUi.stack} role="status" aria-label={t("refreshing")}>
    <div className={adminUi.metrics} aria-hidden="true">{[0, 1, 2, 3].map(index => <div className={`${adminUi.skeleton} min-h-32`} key={index} />)}</div>
    <div className={`${adminUi.skeleton} min-h-[330px]`} aria-hidden="true" />
  </div>
}

/** Gives Recharts a measured, mechanical entrance without overriding its own path animation. */
export function ChartMotion({ children, motionKey }: { children: ReactNode; motionKey: string }) {
  const root = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion || !root.current) return
    const context = gsap.context(() => {
      const layers = root.current?.querySelectorAll(".recharts-cartesian-grid, .recharts-xAxis, .recharts-yAxis, .recharts-reference-line, .recharts-bar-rectangle")
      if (layers?.length) {
        gsap.fromTo(layers, { opacity: 0 }, { opacity: 1, duration: 0.32, stagger: 0.025, ease: "power2.out", clearProps: "opacity" })
      }
    }, root)
    return () => context.revert()
  }, [motionKey, reducedMotion])

  return <motion.div
    ref={root}
    key={motionKey}
    className={`${adminUi.chart} isolate overflow-hidden rounded-md`}
    initial={reducedMotion ? false : { opacity: 0, y: 7 }}
    animate={{ opacity: 1, y: 0 }}
    transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
  ><div className="pointer-events-none absolute inset-0 z-0 opacity-[0.2]" aria-hidden="true"><DotReliefBackground scale={0.58} /></div><div className="relative z-10">{children}</div></motion.div>
}

export function ActivityChart({ data, unit, monthly = false }: {
  data: { date: string; value: number }[]; unit: string; monthly?: boolean
}) {
  const locale = useCurrentLocale()
  const t = useScopedI18n("adminConsole")
  const reducedMotion = useReducedMotion()
  const gradientId = useId().replaceAll(":", "")
  const intlLocale = locale === "ua" ? "uk" : locale
  const number = new Intl.NumberFormat(intlLocale)
  const date = new Intl.DateTimeFormat(intlLocale, { month: "short", ...(monthly ? { year: "2-digit" as const } : { day: "numeric" as const }), timeZone: "UTC" })
  const formatDate = (value: string) => date.format(new Date(value.length === 7 ? `${value}-01T00:00:00Z` : `${value}T00:00:00Z`))
  const empty = data.every(item => item.value === 0)
  const motionKey = `${monthly}:${data.map(item => `${item.date}-${item.value}`).join("|")}`
  return <ChartMotion motionKey={motionKey}>
    {empty && <p className="pointer-events-none absolute top-[30%] w-full text-center text-[12px] text-[var(--3d-dot-c-aeb7bf)]">{t("noActivity")}</p>}
    <ResponsiveContainer width="100%" height={260} minWidth={0}>
      <AreaChart data={data} margin={{ top: 24, right: 14, bottom: 8, left: -18 }} accessibilityLayer>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--3d-dot-c-d9e0e3)" stopOpacity={0.14} />
          <stop offset="100%" stopColor="var(--3d-dot-c-d9e0e3)" stopOpacity={0} />
        </linearGradient></defs>
        <CartesianGrid stroke="var(--3d-dot-c-34383b)" strokeDasharray="2 6" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={40} axisLine={false} tickLine={false} tick={{ fill: "var(--3d-dot-c-a1a7ad)", fontSize: 11 }} />
        <YAxis allowDecimals={false} domain={[0, empty ? 4 : "auto"]} axisLine={false} tickLine={false} tick={{ fill: "var(--3d-dot-c-a1a7ad)", fontSize: 11 }} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-[5px] border border-[var(--3d-dot-c-66717a)] bg-[var(--3d-dot-c-30373d)] px-sm py-sm text-[11px] text-[var(--3d-dot-c-d4dce2)] shadow-[0_8px_24px_var(--3d-dot-c-000b)]">
          <span>{formatDate(String(label))}</span><strong>{unit}: {number.format(Number(payload[0].value))}</strong>
        </div> : null} cursor={{ stroke: "var(--3d-dot-c-8a9197)", strokeDasharray: "3 4" }} />
        <Area type="linear" dataKey="value" stroke="var(--3d-dot-c-e3e8eb)" strokeWidth={1.7} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4, fill: "var(--3d-dot-c-f4f6f8)", stroke: "var(--3d-dot-c-2a2e32)", strokeWidth: 3 }} isAnimationActive={!reducedMotion} animationBegin={140} animationDuration={620} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  </ChartMotion>
}

export function Breakdown({ title, items, total }: { title: string; items: { name: string; count: number }[]; total: number }) {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const [expanded, setExpanded] = useState(false)
  const number = new Intl.NumberFormat(locale === "ua" ? "uk" : locale)
  const percent = new Intl.NumberFormat(locale === "ua" ? "uk" : locale, { style: "percent", maximumFractionDigits: 1 })
  return <section className={adminUi.panel}>
    <PanelRelief />
    <h2 className={adminUi.heading}>{title}<span className={adminUi.count}>{number.format(items.length)}</span></h2>
    {items.length ? <div className="mt-md grid gap-sm">{(expanded ? items : items.slice(0, 5)).map(item => <div key={item.name}>
      <div className="mb-xs flex items-center justify-between gap-sm text-xs"><span className="min-w-0 [overflow-wrap:anywhere] text-[var(--3d-dot-c-d5dde2)]">{item.name}</span><span className={`${adminUi.mono} shrink-0 text-xs text-[var(--3d-dot-c-e1e9ee)]`}>{number.format(item.count)} <small className="ml-xs text-xs text-[var(--3d-dot-c-aebbc5)]">{percent.format(total ? item.count / total : 0)}</small></span></div>
      <span className="block h-[3px] overflow-hidden rounded bg-[var(--3d-dot-c-121719)]"><span className="block h-full rounded bg-[linear-gradient(90deg,var(--3d-dot-c-54616a),var(--3d-dot-c-99a8b3))]" style={{ width: `${total ? item.count / total * 100 : 0}%` }} /></span>
    </div>)}</div> : <p className={adminUi.empty}>{t("noActivity")}</p>}
    {items.length > 5 && <button type="button" className="mt-sm min-h-10 text-[11px] text-[var(--3d-dot-c-c5d1db)] underline underline-offset-4" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? t("showLess") : t("showAll", { count: items.length })}</button>}
  </section>
}
