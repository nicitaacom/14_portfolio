"use client"

import { ReactNode, useMemo, useState } from "react"
import { Button } from "../Button"
import { ModalContainer } from "./ModalContainer"
import { CollaborationIcon } from "../CollaborationIcon"

import { PiTelegramLogoBold } from "react-icons/pi"
import { RiDiscordLine } from "react-icons/ri"
import { FiCalendar, FiUsers, FiFileText, FiLayers, FiArrowUpRight } from "react-icons/fi"
import { useScopedI18n } from "@/locales/client"
import { NewYearModalStillLife } from "@/components/NewYear/NewYearModalStillLife"
import { NewYearSnowParticleField } from "@/components/NewYear/NewYearSnowParticleField"
import { useSiteTheme } from "@/hooks/useSiteTheme"
import { resolveNewYearGreetingImage } from "@/utils/resolveNewYearGreetingImage"

// section name -> (achievement description -> optional proof link)
export type GroupedAchievements = Record<string, Record<string, string | undefined>>

export interface Collaborator {
  name?: string
  imgSrc?: string
  collaboratorUrl?: string
  description: ReactNode | GroupedAchievements
}

function isGroupedAchievements(description: unknown): description is GroupedAchievements {
  if (typeof description !== "object" || description === null || Array.isArray(description)) return false
  return Object.values(description).every(
    section => typeof section === "object" && section !== null && !Array.isArray(section),
  )
}

interface ModalInfoProps {
  isOpen: boolean
  onClose: () => void
  label: string
  collaborators: Collaborator[]
  taskLabel?: string
  stack?: string
  deadline?: string
  siteUrl?: string
  badge?: string
  notice?: ReactNode
  contributionTitle?: string
}

function formatAchievement(description: string) {
  return description.charAt(0).toUpperCase() + description.slice(1)
}

function GroupedAchievementsContent({ description }: { description: GroupedAchievements }) {
  const t = useScopedI18n("projectModal")

  return (
    <div className="flex flex-col gap-y-lg">
      {Object.entries(description).map(([sectionTitle, achievements]) => (
        <section key={sectionTitle} className="flex flex-col gap-y-sm">
          <h2 className="text-sm font-bold tracking-wide text-secondary">{sectionTitle}</h2>
          <div className="grid grid-cols-1 gap-sm">
            {Object.entries(achievements).map(([achievementDescription, proofLink]) => (
              <article
                key={achievementDescription}
                className="group flex items-start gap-sm rounded-md border border-secondary-foreground/10 bg-primary/35 p-sm transition-colors duration-200 hover:border-secondary-foreground/20">
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-secondary-foreground/75">
                  {formatAchievement(achievementDescription)}
                </p>
                {proofLink && (
                  <div className="flex shrink-0 justify-end">
                    <Button
                      aria-label={t("proofAriaLabel", { description: formatAchievement(achievementDescription) })}
                      className="proof-control group/proof mt-0 h-7 min-w-[92px] !gap-x-[2px] rounded-md border-cta/45 bg-cta/[0.08] !px-xs !py-0 text-xs font-semibold text-cta shadow-[0_0_0_1px_hsl(var(--cta)/0.04)] hover:border-cta hover:bg-cta/80 hover:shadow-[0_0_12px_hsl(var(--cta)/0.3)]"
                      onClick={() =>
                        window.open(
                          proofLink.startsWith("http") ? proofLink : `https://${proofLink}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      type="button">
                      <span className="proof-label text-cta transition-colors duration-300 group-hover/proof:text-[#111]">
                        {t("proof")}
                      </span>
                      <FiArrowUpRight
                        size={13}
                        aria-hidden="true"
                        className="proof-label text-cta transition-colors duration-300 group-hover/proof:text-[#111] group-hover/proof:translate-x-[2px] group-hover/proof:-translate-y-[2px]"
                      />
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function DescriptionContent({ description }: { description: ReactNode | GroupedAchievements }) {
  if (isGroupedAchievements(description)) return <GroupedAchievementsContent description={description} />
  if (typeof description !== "string") return <>{description}</>

  return (
    <div className="flex flex-col gap-y-xs">
      {description.split("\n").map((line, index) => {
        const text = line.trim()

        if (!text) return <div key={index} className="h-xs" aria-hidden="true" />

        if (text.startsWith("-") || text.startsWith("•")) {
          return (
            <div key={index} className="flex items-start gap-x-sm text-sm leading-relaxed">
              <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-cta/75" aria-hidden="true" />
              <span>{text.replace(/^[-•]\s*/, "")}</span>
            </div>
          )
        }

        if (text.endsWith(":")) {
          return (
            <p key={index} className="pt-xs text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground/50">
              {text}
            </p>
          )
        }

        return (
          <p key={index} className="text-sm leading-relaxed">
            {text}
          </p>
        )
      })}
    </div>
  )
}

export function ModalMoreInfo({
  isOpen,
  onClose,
  label,
  taskLabel,
  stack,
  deadline,
  collaborators,
  siteUrl,
  badge,
  notice,
  contributionTitle,
}: ModalInfoProps) {
  const t = useScopedI18n("projectModal")
  const commonT = useScopedI18n("common")
  const theme = useSiteTheme()
  const resolvedContributionTitle = contributionTitle ?? t("whatIDid")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = collaborators[selectedIndex]
  const newYearGreetingImage = useMemo(() => resolveNewYearGreetingImage(new Date().getFullYear()), [])

  return (
    <ModalContainer
      className="project-more-info-modal flex max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] flex-col tablet:max-h-[90vh] tablet:max-w-[900px] laptop:max-w-[1180px] desktop:max-w-[1280px]"
      isOpen={isOpen}
      onClose={onClose}
      title={badge ?? label}
      titleHref={siteUrl}>
      <NewYearModalStillLife />
      <div className="project-modal-content relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="project-modal-header relative shrink-0 overflow-hidden border-b border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--paper)/0.06),transparent_70%)] px-md py-sm pr-xl shadow-[0_2px_0_rgb(0_0_0/0.22),inset_0_1px_0_rgb(255_255_255/0.1)] tablet:py-md">
          <div
            className="project-modal-header-wash pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--cta)/0.12),transparent_48%)]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-start gap-y-xs">
            <h1 className="sr-only">{label}</h1>
            {theme === "new-year" && <NewYearSnowParticleField seedText={label} />}
            <span
              className="new-year-modal-greeting-art"
              style={{ "--new-year-greeting-image": `url(${newYearGreetingImage})` } as React.CSSProperties}
              aria-hidden="true">
              <span className="new-year-modal-greeting-center" />
            </span>
          </div>
        </header>

        <main className="modal-scroll hide-scrollbar flex-1 overflow-y-auto px-sm pb-sm pt-0 tablet:px-md tablet:pb-md tablet:pt-0">
          <div className="grid items-start gap-sm laptop:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="project-modal-aside flex h-fit self-start flex-col gap-y-sm laptop:sticky laptop:top-sm laptop:z-10 laptop:max-h-[calc(100dvh-14rem)] laptop:overflow-y-auto laptop:self-start">
              {notice}

              {taskLabel && (
                <section className="project-modal-section project-modal-task rounded-[3px] border border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--steel-deep)/0.74),hsl(var(--wood)/0.35))] p-sm shadow-[inset_0_3px_6px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06),0_2px_3px_rgb(0_0_0/0.3)]">
                  <div className="mb-sm flex items-center gap-x-sm text-xs font-bold uppercase tracking-[0.14em] text-cta">
                    <FiFileText size={15} />
                    <span>{t("projectTask")}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-secondary-foreground/80">{taskLabel}</p>
                </section>
              )}

              {stack && (
                <section className="project-modal-section project-modal-stack rounded-[3px] border border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--steel-deep)/0.74),hsl(var(--wood)/0.35))] p-sm shadow-[inset_0_3px_6px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06),0_2px_3px_rgb(0_0_0/0.3)]">
                  <div className="mb-sm flex items-center gap-x-sm text-xs font-bold uppercase tracking-[0.14em] text-cta">
                    <FiLayers size={15} />
                    <span>{t("projectStack")}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-secondary-foreground/80">{stack}</p>
                </section>
              )}

              {deadline && (
                <section className="project-modal-section project-modal-deadline rounded-[3px] border border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--steel-deep)/0.74),hsl(var(--wood)/0.35))] p-sm shadow-[inset_0_3px_6px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06),0_2px_3px_rgb(0_0_0/0.3)]">
                  <div className="mb-sm flex items-center gap-x-sm text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground/45">
                    <FiCalendar size={15} />
                    <span>{t("deadline")}</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary">{deadline}</p>
                </section>
              )}

              {/* project-modal-collaboration marks this card as the one that never takes a photo.
                  The New Year theme hands the aside's photos out by position, and this card is
                  the only one whose place in the column moves with whatever the project defines */}
              <section className="project-modal-section project-modal-collaboration rounded-[3px] border border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--steel-deep)/0.74),hsl(var(--wood)/0.35))] p-sm shadow-[inset_0_3px_6px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06),0_2px_3px_rgb(0_0_0/0.3)]">
                <div className="mb-sm flex items-center gap-x-sm text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground/45">
                  <FiUsers size={15} />
                  <span>{t("collaboration")}</span>
                </div>
                <div className="flex flex-wrap gap-sm laptop:flex-col">
                  {collaborators.map((collaborator, index) => (
                    <CollaborationIcon
                      key={`${collaborator.name ?? "nicitaacom"}-${index}`}
                      name={collaborator.name}
                      imgSrc={collaborator.imgSrc}
                      collaboratorUrl={collaborator.collaboratorUrl}
                      isSelected={selectedIndex === index}
                      onClick={() => setSelectedIndex(index)}
                    />
                  ))}
                </div>
              </section>
            </aside>

            <section className="project-modal-section project-modal-contribution min-w-0 overflow-hidden rounded-[3px] border border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--steel-deep)/0.74),hsl(var(--wood)/0.35))] shadow-[inset_0_3px_6px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06),0_2px_3px_rgb(0_0_0/0.3)]">
              <div className="project-modal-section-header flex min-h-[60px] items-center border-b border-brass/40 bg-[linear-gradient(to_bottom,hsl(var(--paper)/0.06),transparent)] px-md py-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cta">{resolvedContributionTitle}</p>
                  <p className="mt-xs text-xs text-secondary-foreground/40">{t("selectedContributorOutcomes")}</p>
                </div>
              </div>

              {selected && (
                <div className="project-modal-contribution-body p-md text-secondary-foreground/70">
                  <DescriptionContent description={selected.description} />
                </div>
              )}
            </section>
          </div>
        </main>

        <footer className="project-modal-footer flex shrink-0 flex-col items-end gap-y-sm border-t border-brass/60 bg-[linear-gradient(to_bottom,hsl(var(--steel-deep)/0.3),hsl(var(--wood)/0.55))] px-md py-sm shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="text-xs font-medium italic text-secondary-foreground/40">{t("similarSite")}</p>
          <div className="flex items-center gap-x-sm">
            <Button
              className="project-modal-action !border-brass/80 !bg-[repeating-linear-gradient(2deg,hsl(var(--steel-deep)/0.24)_0_1px,transparent_1px_6px),linear-gradient(to_bottom,hsl(var(--brass)/0.42),hsl(var(--wood)/0.97))] px-sm py-xs text-xs !shadow-[0_3px_0_hsl(var(--steel-deep)),0_7px_10px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.18)]"
              onClick={() => window.open("https://discord.com/users/780002958380498955")}>
              {commonT("discord")} <RiDiscordLine size={18} />
            </Button>
            <Button
              className="project-modal-action !border-brass/80 !bg-[repeating-linear-gradient(2deg,hsl(var(--steel-deep)/0.24)_0_1px,transparent_1px_6px),linear-gradient(to_bottom,hsl(var(--brass)/0.42),hsl(var(--wood)/0.97))] px-sm py-xs text-xs !shadow-[0_3px_0_hsl(var(--steel-deep)),0_7px_10px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.18)]"
              onClick={() => window.open("https://t.me/nicitaacom")}>
              {commonT("telegram")} <PiTelegramLogoBold size={18} />
            </Button>
          </div>
        </footer>
      </div>
    </ModalContainer>
  )
}
