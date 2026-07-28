"use client"

import { ReactNode, useState } from "react"
import { Button } from "../Button"
import { ModalContainer } from "./ModalContainer"
import { CollaborationIcon } from "../CollaborationIcon"

import { PiTelegramLogoBold } from "react-icons/pi"
import { RiDiscordLine } from "react-icons/ri"
import { FiCalendar, FiUsers, FiFileText, FiExternalLink } from "react-icons/fi"
import { useScopedI18n } from "@/locales/client"

export interface Collaborator {
  name?: string
  imgSrc?: string
  collaboratorUrl?: string
  description: ReactNode
}

interface ModalInfoProps {
  isOpen: boolean
  onClose: () => void
  label: string
  collaborators: Collaborator[]
  taskLabel?: string
  deadline?: string
  siteUrl?: string
  badge?: string
  notice?: ReactNode
  contributionTitle?: string
}

function DescriptionContent({ description }: { description: ReactNode }) {
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
  deadline,
  collaborators,
  siteUrl,
  badge,
  notice,
  contributionTitle,
}: ModalInfoProps) {
  const t = useScopedI18n("projectModal")
  const resolvedContributionTitle = contributionTitle ?? t("whatIDid")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = collaborators[selectedIndex]

  return (
    <ModalContainer
      className="flex h-[calc(100dvh-1rem)] max-h-[940px] max-w-[calc(100vw-1rem)] flex-col tablet:h-[90vh] tablet:max-w-[900px] laptop:max-w-[1180px] desktop:max-w-[1280px]"
      isOpen={isOpen}
      onClose={onClose}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <header className="relative shrink-0 overflow-hidden border-b border-secondary-foreground/10 px-md py-sm pr-xl tablet:py-md">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--cta)/0.12),transparent_48%)]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-start gap-y-xs">
            {badge && (
              <span className="rounded-md border border-cta/35 bg-cta/10 px-sm py-[5px] text-[10px] font-bold uppercase tracking-[0.14em] text-cta">
                {badge}
              </span>
            )}
            <h1 className="text-xl font-bold tracking-tight text-secondary">
              {siteUrl ? (
                <a
                  className="inline-flex items-center gap-x-sm transition-colors duration-300 hover:text-cta"
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer">
                  {label}
                  <FiExternalLink className="opacity-45" size={16} />
                </a>
              ) : (
                label
              )}
            </h1>
          </div>
        </header>

        <main className="modal-scroll hide-scrollbar flex-1 overflow-y-auto p-sm tablet:p-md">
          <div className="grid items-start gap-sm laptop:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="flex flex-col gap-y-sm laptop:sticky laptop:top-0">
              {notice}

              {taskLabel && (
                <section className="rounded-md border border-secondary-foreground/10 bg-secondary-foreground/[0.025] p-sm">
                  <div className="mb-sm flex items-center gap-x-sm text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground/45">
                    <FiFileText size={15} />
                    <span>{t("projectTask")}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-secondary-foreground/80">{taskLabel}</p>
                </section>
              )}

              {deadline && (
                <section className="rounded-md border border-secondary-foreground/10 bg-secondary-foreground/[0.025] p-sm">
                  <div className="mb-sm flex items-center gap-x-sm text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground/45">
                    <FiCalendar size={15} />
                    <span>{t("deadline")}</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary">{deadline}</p>
                </section>
              )}

              <section className="rounded-md border border-secondary-foreground/10 bg-secondary-foreground/[0.025] p-sm">
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

            <section className="min-w-0 overflow-hidden rounded-md border border-secondary-foreground/10 bg-secondary-foreground/[0.025]">
              <div className="flex min-h-[60px] items-center border-b border-secondary-foreground/10 bg-secondary-foreground/[0.025] px-md py-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cta">{resolvedContributionTitle}</p>
                  <p className="mt-xs text-xs text-secondary-foreground/40">{t("selectedContributorOutcomes")}</p>
                </div>
              </div>

              {selected && (
                <div className="p-md text-secondary-foreground/70">
                  <DescriptionContent description={selected.description} />
                </div>
              )}
            </section>
          </div>
        </main>

        <footer className="flex shrink-0 flex-col items-end gap-y-sm border-t border-secondary-foreground/10 bg-secondary-foreground/[0.02] px-md py-sm tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="text-xs font-medium italic text-secondary-foreground/40">{t("similarSite")}</p>
          <div className="flex items-center gap-x-sm">
            <Button
              className="text-xs py-xs px-sm"
              onClick={() => window.open("https://discord.com/users/780002958380498955")}>
              Discord <RiDiscordLine size={18} />
            </Button>
            <Button className="text-xs py-xs px-sm" onClick={() => window.open("https://t.me/nicitaacom")}>
              Telegram <PiTelegramLogoBold size={18} />
            </Button>
          </div>
        </footer>
      </div>
    </ModalContainer>
  )
}
