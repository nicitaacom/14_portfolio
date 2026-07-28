"use client"

import { NdaAchievements } from "@/data/ndaProject"
import { Button } from "@/components/Button"
import { useScopedI18n } from "@/locales/client"
import { FiArrowUpRight, FiLock } from "react-icons/fi"

export function NDANotice() {
  const t = useScopedI18n("ndaProject.notice")

  return (
    <aside className="relative overflow-hidden rounded-md border border-cta/30 bg-cta/[0.065] p-sm">
      <div className="relative flex items-start gap-x-sm">
        <div className="relative top-[2px] flex h-6 w-6 shrink-0 items-center justify-center text-cta">
          <FiLock size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-secondary">{t("title")}</p>
          <p className="mt-xs text-xs leading-relaxed text-secondary-foreground/65">{t("description")}</p>
        </div>
      </div>
    </aside>
  )
}

interface NDAContributionDetailsProps {
  achievements: NdaAchievements
}

export function NDAContributionDetails({ achievements }: NDAContributionDetailsProps) {
  const t = useScopedI18n("ndaProject.details")
  const achievementEntries = Object.entries(achievements)

  return (
    <div className="flex flex-col gap-y-lg">
      <div className="flex flex-col gap-y-xs border-b border-secondary-foreground/10 pb-md">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cta">
          {t("deliveredOutcomes", { count: achievementEntries.length })}
        </p>
        <p className="max-w-[720px] text-sm leading-relaxed text-secondary-foreground/65">{t("intro")}</p>
      </div>

      <div className="grid gap-sm laptop:grid-cols-2">
        {achievementEntries.map(([description, proofLink]) => (
          <article
            key={description}
            className="group flex flex-col rounded-md border border-secondary-foreground/10 bg-primary/35 p-md transition-colors duration-200 hover:border-secondary-foreground/20">
            <p className="text-sm leading-relaxed text-secondary-foreground/75">{description}</p>
            {proofLink && (
              <div className="mt-auto flex justify-end pt-sm">
                <Button
                  aria-label={`View proof for: ${description}`}
                  className="group/proof mt-0 h-7 min-w-[92px] gap-x-[2px] rounded-md border-cta/45 bg-cta/[0.08] px-sm py-0 text-xs font-semibold text-cta shadow-[0_0_0_1px_hsl(var(--cta)/0.04)] hover:border-cta hover:bg-cta/80 hover:shadow-[0_0_12px_hsl(var(--cta)/0.3)]"
                  onClick={() =>
                    window.open(
                      proofLink.startsWith("http") ? proofLink : `https://${proofLink}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  type="button">
                  <span className="text-cta transition-colors duration-300 group-hover/proof:text-[#111]">Proof</span>
                  <FiArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="text-cta transition-colors duration-300 group-hover/proof:text-[#111] group-hover/proof:translate-x-[2px] group-hover/proof:-translate-y-[2px]"
                  />
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
