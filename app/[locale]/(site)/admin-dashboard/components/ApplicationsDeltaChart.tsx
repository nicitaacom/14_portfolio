"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useReducedMotion } from "framer-motion"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import type { TJobSearchMonth } from "../types/TJobSearchMonth"
import { adminUi, ChartMotion } from "./AdminUI"

export function ApplicationsDeltaChart({ months }: { months: TJobSearchMonth[] }) {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const reducedMotion = useReducedMotion()
  const date = new Intl.DateTimeFormat(locale === "ua" ? "uk" : locale, { month: "short", year: "2-digit", timeZone: "UTC" })
  const data = [...months].sort((a, b) => a.month.localeCompare(b.month)).filter(month => month.applicationsAdded !== null)
    .map(month => ({
      label: date.format(new Date(month.month + "-01T00:00:00Z")),
      applications: month.applicationsAdded,
    }))

  if (!data.length) return null

  return (
    <section className={adminUi.panel}>
      <header className={adminUi.panelHeader}><h3 className={adminUi.heading}>{t("applicationsChartTitle")}</h3></header>
      <ChartMotion motionKey={data.map(month => `${month.label}-${month.applications}`).join("|")}>
        <div role="img" aria-label={t("applicationsChartTitle")}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }} barSize={32} accessibilityLayer>
            <CartesianGrid strokeDasharray="2 6" stroke="var(--3d-dot-c-3c3e41)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--3d-dot-c-b9bbc0)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--3d-dot-c-b9bbc0)", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              contentStyle={{ background: "var(--3d-dot-c-202225)", border: "1px solid var(--3d-dot-c-5b5e63)", borderRadius: 6, color: "var(--3d-dot-c-f0f0f2)" }}
              itemStyle={{ color: "var(--3d-dot-c-f0f0f2)" }}
              labelStyle={{ color: "var(--3d-dot-c-b9bbc0)" }}
              cursor={{ fill: "var(--3d-dot-c-ffffff08)" }}
            />
            <Bar dataKey="applications" name={t("monthlyApplications")} fill="var(--3d-dot-c-d2d4d8)" radius={[3, 3, 0, 0]} isAnimationActive={!reducedMotion} animationBegin={140} animationDuration={520} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </ChartMotion>
    </section>
  )
}
