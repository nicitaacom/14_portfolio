"use client"

import { jobSearchStats, jobSearchStatsError } from "../data/jobSearchStats"
import { ApplicationsDeltaChart } from "./ApplicationsDeltaChart"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { adminUi } from "./AdminUI"

const AVATAR_DOC_URL = "https://docs.google.com/document/d/1KnNw5OJ6iL7-ZSGpE74MYBMUUARHin3KnETWWKDuywc/edit?tab=t.0"

export function JobSearchDashboardSection() {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const number = new Intl.NumberFormat(locale === "ua" ? "uk" : locale, { maximumFractionDigits: 1 })
  const percentage = new Intl.NumberFormat(locale === "ua" ? "uk" : locale, { maximumFractionDigits: 2 })
  const date = new Intl.DateTimeFormat(locale === "ua" ? "uk" : locale, { month: "short", year: "numeric", timeZone: "UTC" })
  const monthLabel = (month: string) => date.format(new Date(month + "-01T00:00:00Z"))
  const latest = jobSearchStats.at(-1)
  const measured = jobSearchStats.filter(month => month.applicationsAdded !== null)
  const rates = measured.flatMap(month => month.conversionRate === null ? [] : [month.conversionRate])
  const average = (values: number[]) => values.length ? number.format(values.reduce((sum, value) => sum + value, 0) / values.length) : "—"

  return (
    <div className={adminUi.stack}>
      <div className={adminUi.toolbar}>
        <p className={adminUi.muted}>{t("jobSearchSubtitle")}</p>
        <a className={adminUi.button} href={AVATAR_DOC_URL} rel="noopener noreferrer" target="_blank">{t("avatarDocLink")}</a>
      </div>

      {jobSearchStatsError ? <p className={adminUi.error} role="alert">{t("jobSearchInvalidData")}</p> : !latest ? (
        <p className={adminUi.empty}>{t("noJobSearchData")}</p>
      ) : (
        <>
          <p className={adminUi.eyebrow}>{t("jobSearchDataAsOf", { date: monthLabel(latest.month) })}</p>
          <dl className={`${adminUi.metrics} laptop:grid-cols-3`}>
            {[["totalApplications", number.format(latest.totalApplications)], ["totalInterviews", number.format(latest.totalInterviews)], ["monthsTracked", jobSearchStats.length], ["avgApplications", average(measured.map(month => month.applicationsAdded!))], ["avgInterviews", average(measured.map(month => month.interviewsAdded!))], ["avgConversionRate", rates.length ? percentage.format(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) + "%" : "—"]].map(([label, value]) => <div key={String(label)}><dt className="font-typewriter text-[10px] uppercase tracking-[1px] text-[var(--3d-dot-c-a8b1b9)]">{t(label as "totalApplications")}</dt><dd className="mt-xs text-[25px] leading-tight text-[var(--3d-dot-c-eff3f6)] tablet:text-[31px]">{value}</dd></div>)}
          </dl>
          <ApplicationsDeltaChart months={jobSearchStats} />
          <section className={adminUi.panel}>
            <header className={adminUi.panelHeader}>
              <h3 className={adminUi.heading}>{t("jobSearchHistory")}</h3>
            </header>
            <p className={adminUi.muted}>{t("baselineDescription")}</p>
            <div className="max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label={t("jobSearchHistory")}>
              <table className="w-full border-collapse text-left text-[12px] [&_td]:border-b [&_td]:border-[var(--3d-dot-c-343f48)] [&_td]:p-sm [&_td]:text-[var(--3d-dot-c-d2dde6)] [&_th]:border-b [&_th]:border-[var(--3d-dot-c-4a555e)] [&_th]:p-sm [&_th]:text-[10px] [&_th]:font-normal [&_th]:text-[var(--3d-dot-c-9eadb9)]">
                <thead><tr>
                  <th scope="col">{t("month")}</th>
                  <th scope="col">{t("monthlyApplications")}</th>
                  <th scope="col">{t("monthlyInterviews")}</th>
                  <th scope="col">{t("conversionRate")}</th>
                  <th scope="col">{t("cumulativeApplications")}</th>
                  <th scope="col">{t("cumulativeInterviews")}</th>
                </tr></thead>
                <tbody>{[...jobSearchStats].reverse().map(month => (
                  <tr key={month.month}>
                    <th scope="row">{monthLabel(month.month)}{month.applicationsAdded === null && <small className={adminUi.muted}> · {t("baseline")}</small>}</th>
                    <td>{month.applicationsAdded === null ? "—" : number.format(month.applicationsAdded)}</td>
                    <td>{month.interviewsAdded === null ? "—" : number.format(month.interviewsAdded)}</td>
                    <td>{month.conversionRate === null ? "—" : percentage.format(month.conversionRate) + "%"}</td>
                    <td>{number.format(month.totalApplications)}</td>
                    <td>{number.format(month.totalInterviews)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
