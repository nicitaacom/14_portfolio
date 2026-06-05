"use client"

import { useEffect, useMemo, useState } from "react"
import { FiRefreshCcw } from "react-icons/fi"
import { selectDBUTMStatsAction, UTMAggregatedStats } from "../actions/selectDBUTMStatsAction"
import { useScopedI18n } from "@/locales/client"

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2px] border border-[#343434] bg-[#202020] px-sm py-xs">
      <p className="text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">{label}</p>
      <p className="mt-[6px] text-lg text-secondary">{value}</p>
    </div>
  )
}

function StatPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-[2px] border border-[#3a3a3a] bg-[#262626] px-[10px] py-[6px] text-xs text-secondary">
      <span className="font-medium text-[#f5f7fb]">{label}</span>
      <span className="text-[#a8b1c7]">{count}</span>
    </div>
  )
}

export function UTMStatsDashboardSection() {
  const [utmStats, setUtmStats] = useState<UTMAggregatedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useScopedI18n("admin")

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      setError(null)

      const result = await selectDBUTMStatsAction()
      if (typeof result === "string") {
        setError(result)
        setUtmStats(null)
      } else {
        setUtmStats(result)
      }

      setLoading(false)
    }

    void loadStats()
  }, [])

  const topSources = useMemo(() => utmStats?.sourceStats.slice(0, 4) ?? [], [utmStats])
  const topCampaigns = useMemo(() => utmStats?.campaignStats.slice(0, 4) ?? [], [utmStats])

  return (
    <section className="rounded-[2px] border border-[#323232] bg-[#242424] p-sm shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
      <div className="mb-sm flex flex-col gap-[4px]">
        <h2 className="text-sm uppercase tracking-[0.18em] text-secondary">{t("utmOverviewTitle")}</h2>
        <p className="text-xs text-secondary-foreground">{t("utmOverviewSubtitle")}</p>
      </div>

      <div className="flex justify-end">
        <button
          className="inline-flex items-center justify-center gap-[8px] rounded-[2px] border border-[#343434] bg-[#2a2a2a] px-sm py-xs text-secondary hover:bg-[#2f2f2f] transition"
          onClick={async () => {
            setLoading(true)
            const result = await selectDBUTMStatsAction()
            if (typeof result === "string") {
              setError(result)
              setUtmStats(null)
            } else {
              setUtmStats(result)
              setError(null)
            }
            setLoading(false)
          }}>
          <FiRefreshCcw size={14} />
          {t("refresh")}
        </button>
      </div>

      {error ? (
        <div className="rounded-[2px] border border-danger/20 bg-[#2d1218] px-sm py-sm text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-[10px] md:grid-cols-3">
          {[1, 2, 3].map(index => (
            <div key={index} className="h-[95px] animate-pulse rounded-[2px] bg-[#202020]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-[10px] md:grid-cols-3">
          <SummaryCard label={t("totalVisits")} value={utmStats?.totalVisits ?? 0} />
          <SummaryCard label={t("uniqueUsers")} value={utmStats?.uniqueUsers ?? 0} />
          <SummaryCard label={t("recentVisits")} value={utmStats?.recentVisits ?? 0} />
        </div>
      )}

      <div className="mt-sm grid gap-[10px] lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2px] border border-[#343434] bg-[#202020] p-sm">
          <h3 className="mb-sm text-sm uppercase tracking-[0.18em] text-secondary-foreground">{t("topSources")}</h3>
          {loading ? (
            <div className="space-y-[8px]">
              {[1, 2, 3, 4].map(index => (
                <div key={index} className="h-[34px] animate-pulse rounded-[2px] bg-[#1f1f1f]" />
              ))}
            </div>
          ) : topSources.length ? (
            <div className="grid gap-[8px]">
              {topSources.map(source => (
                <StatPill key={source.name} label={source.name} count={source.count} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{t("noSourceData")}</p>
          )}
        </div>

        <div className="rounded-[2px] border border-[#343434] bg-[#202020] p-sm">
          <h3 className="mb-sm text-sm uppercase tracking-[0.18em] text-secondary-foreground">{t("topCampaigns")}</h3>
          {loading ? (
            <div className="space-y-[8px]">
              {[1, 2, 3].map(index => (
                <div key={index} className="h-[34px] animate-pulse rounded-[2px] bg-[#1f1f1f]" />
              ))}
            </div>
          ) : topCampaigns.length ? (
            <div className="grid gap-[8px]">
              {topCampaigns.map(campaign => (
                <StatPill key={campaign.name} label={campaign.name} count={campaign.count} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{t("noCampaignData")}</p>
          )}
        </div>
      </div>
    </section>
  )
}
