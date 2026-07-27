"use client"

import { ndaAchievementGroups } from "@/data/ndaProject"
import { useScopedI18n } from "@/locales/client"
import { FiLock } from "react-icons/fi"

const achievementCount = ndaAchievementGroups.reduce((total, group) => total + group.achievements.length, 0)
const achievementLinkPattern = /((?:https?:\/\/|imgur\.com\/)[^\s)]+)/g

function AchievementText({ text }: { text: string }) {
  return (
    <>
      {text.split(achievementLinkPattern).map((part, index) => {
        const isLink = /^(?:https?:\/\/|imgur\.com\/)/.test(part)

        if (!isLink) return part

        return (
          <a
            key={`${part}-${index}`}
            className="break-all text-cta underline decoration-cta/35 underline-offset-[3px] transition-colors duration-200 hover:decoration-cta"
            href={part.startsWith("http") ? part : `https://${part}`}
            target="_blank"
            rel="noopener noreferrer">
            {part}
          </a>
        )
      })}
    </>
  )
}

export function NDANotice() {
  const t = useScopedI18n("ndaProject.notice")

  return (
    <aside className="relative overflow-hidden rounded-md border border-cta/30 bg-cta/[0.065] p-sm">
      <div className="relative flex items-start gap-x-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cta/35 bg-primary/60 text-cta">
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

export function NDAContributionDetails() {
  const t = useScopedI18n("ndaProject.details")

  return (
    <div className="flex flex-col gap-y-lg">
      <div className="flex flex-col gap-y-xs border-b border-secondary-foreground/10 pb-md">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cta">
          {t("deliveredOutcomes", { count: achievementCount })}
        </p>
        <p className="max-w-[720px] text-sm leading-relaxed text-secondary-foreground/65">{t("intro")}</p>
      </div>

      {ndaAchievementGroups.map((group, groupIndex) => (
        <section key={group.title} className="nda-achievement-group flex flex-col gap-y-sm">
          <div className="flex items-start gap-x-sm">
            <span className="mt-[1px] grid h-[30px] w-[30px] shrink-0 place-items-center overflow-hidden rounded-md border border-cta/30 bg-cta/[0.07] text-[11px] font-bold leading-none tabular-nums text-cta shadow-[inset_0_0_12px_hsl(var(--cta)/0.07)]">
              {groupIndex + 1}
            </span>
            <div>
              <h2 className="text-base font-bold text-secondary">{group.title}</h2>
            </div>
          </div>

          <div className="grid gap-sm laptop:grid-cols-2">
            {group.achievements.map(achievement => (
              <article
                key={achievement.text}
                className="group rounded-md border border-secondary-foreground/10 bg-primary/35 p-md transition-colors duration-200 hover:border-secondary-foreground/20">
                <p className="text-sm leading-relaxed text-secondary-foreground/75">
                  <AchievementText text={achievement.text} />
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
