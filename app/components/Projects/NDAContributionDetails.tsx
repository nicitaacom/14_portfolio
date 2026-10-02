"use client"

import { NdaAchievementSections, NdaAchievements } from "@/data/ndaProject"
import { memo, useCallback } from "react"
import { Button } from "@/components/Button"
import { useScopedI18n } from "@/locales/client"
import { FiArrowUpRight, FiLock } from "react-icons/fi"

export function NDANotice() {
  const t = useScopedI18n("ndaProject.notice")

  return (
    <aside className="project-modal-notice relative overflow-hidden rounded-md border border-cta/30 bg-cta/[0.065] p-sm">
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
  achievementSections?: NdaAchievementSections
}

function formatDescription(description: string) {
  return description.replace(
    /^(\[[^\]]+\]\s*)?([a-z])/,
    (_, prefix = "", firstLetter: string) => `${prefix}${firstLetter.toUpperCase()}`,
  )
}

function useNDAProofHandlers() {
  const openProof = useCallback((proofLink: string) => {
    window.open(proofLink.startsWith("http") ? proofLink : `https://${proofLink}`, "_blank", "noopener,noreferrer")
  }, [])

  return { openProof }
}

const NDAAchievementCard = memo(function NDAAchievementCard({
  description,
  proofAriaLabel,
  proofLabel,
  proofLink,
  onOpenProof,
}: {
  description: string
  proofAriaLabel: string
  proofLabel: string
  proofLink?: string
  onOpenProof: (proofLink: string) => void
}) {
  const handleOpenProof = useCallback(() => {
    if (proofLink) onOpenProof(proofLink)
  }, [onOpenProof, proofLink])

  return <article className="group flex items-start gap-sm rounded-md border border-secondary-foreground/10 bg-primary/35 p-sm transition-colors duration-200 hover:border-secondary-foreground/20">
    <p className="min-w-0 flex-1 text-sm leading-relaxed text-secondary-foreground/75">{formatDescription(description)}</p>
    {proofLink && <div className="flex shrink-0 justify-end">
      <Button
        aria-label={proofAriaLabel}
        className="proof-control group/proof mt-0 h-7 min-w-[92px] !gap-x-[2px] rounded-md border-cta/45 bg-cta/[0.08] !px-xs !py-0 text-xs font-semibold text-cta shadow-[0_0_0_1px_hsl(var(--cta)/0.04)] hover:border-cta hover:bg-cta/80 hover:shadow-[0_0_12px_hsl(var(--cta)/0.3)]"
        onClick={handleOpenProof}
        type="button">
        <span className="proof-label text-cta transition-colors duration-300 group-hover/proof:text-[#111]">{proofLabel}</span>
        <FiArrowUpRight size={13} aria-hidden="true" className="proof-label text-cta transition-colors duration-300 group-hover/proof:text-[#111] group-hover/proof:translate-x-[2px] group-hover/proof:-translate-y-[2px]" />
      </Button>
    </div>}
  </article>
})

const NDAContributionSection = memo(function NDAContributionSection({
  achievements,
  onOpenProof,
  title,
}: {
  achievements: NdaAchievements
  onOpenProof: (proofLink: string) => void
  title?: string
}) {
  const t = useScopedI18n("ndaProject.details")

  return <section className="flex flex-col gap-y-sm">
    {title && <h2 className="text-sm font-bold tracking-wide text-secondary">{title}</h2>}
    <div className="grid grid-cols-1 gap-sm">
      {Object.entries(achievements).map(([description, proofLink]) => <NDAAchievementCard
        key={description}
        description={description}
        proofAriaLabel={t("proofAriaLabel", { description: formatDescription(description) })}
        proofLabel={t("proof")}
        proofLink={proofLink}
        onOpenProof={onOpenProof}
      />)}
    </div>
  </section>
})

export function NDAContributionDetails({ achievements, achievementSections }: NDAContributionDetailsProps) {
  const t = useScopedI18n("ndaProject.details")
  const { openProof } = useNDAProofHandlers()
  const sections = achievementSections ? Object.entries(achievementSections) : [["", achievements] as const]
  const achievementCount = sections.reduce(
    (total, [, sectionAchievements]) => total + Object.keys(sectionAchievements).length,
    0,
  )
  const sectionTitles = {
    saveMoney: t("sections.saveMoney"),
    backend: t("sections.backend"),
    frontend: t("sections.frontend"),
    dialerCalling: t("sections.dialerCalling"),
    emails: t("sections.emails"),
    ai: t("sections.ai"),
    performance: t("sections.performance"),
    legal: t("sections.legal"),
    socialMediaOutreach: t("sections.socialMediaOutreach"),
    verification: t("sections.verification"),
    payments: t("sections.payments"),
    notifications: t("sections.notifications"),
    scale: t("sections.scale"),
  }

  return (
    <div className="flex flex-col gap-y-lg">
      <div className="flex flex-col gap-y-xs border-b border-secondary-foreground/10 pb-md">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cta">
          {t("deliveredOutcomes", { count: achievementCount })}
        </p>
        <p className="max-w-[720px] text-sm leading-relaxed text-secondary-foreground/65">{t("intro")}</p>
      </div>

      <div className="flex flex-col gap-y-lg">
        {sections.map(([sectionTitle, sectionAchievements]) => <NDAContributionSection
          key={sectionTitle || "achievements"}
          achievements={sectionAchievements}
          onOpenProof={openProof}
          title={sectionTitle ? sectionTitles[sectionTitle as keyof typeof sectionTitles] : undefined}
        />)}
      </div>
    </div>
  )
}
