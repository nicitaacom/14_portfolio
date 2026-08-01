"use client"

import { hours } from "@/data/hours-and-applications"
import { Skill } from "../Skill"
import { useScopedI18n } from "@/locales/client"

function TooltipGithub() {
  const t = useScopedI18n("skills")

  return (
    <div>
      <h1 className="whitespace-pre-line text-secondary text-xs">{t("githubTooltip")}</h1>
    </div>
  )
}

export function TooltipOther() {
  return (
    <div>
      <div className="flex flex-col justify-start items-center gap-y-sm w-[250px] h-fit">
        <Skill
          id={5.1} // Why do I need id here? (5.1 because its fifth skill)
          label="Github Desktop"
          hours={0}
          labelClassName="min-w-[55%]"
          tooltip
          tooltiptext={<TooltipGithub />}
          small
        />
        <Skill id={5.2} label="Vite" hours={hours.vite} labelClassName="min-w-[55%]" small />
        <Skill id={5.3} label="Supabase" hours={hours.other.supabase} labelClassName="min-w-[55%]" small />
        <Skill id={5.4} label="Zustand" hours={hours.other.zustand} labelClassName="min-w-[55%]" small />
        <Skill id={5.8} label="Photoshop" hours={hours.other.photoshop} labelClassName="min-w-[55%]" small />
        <Skill id={5.8} label="Figma" hours={hours.other.figma} labelClassName="min-w-[55%]" small />
        <Skill id={5.8} label="DevOps" hours={hours.other.devops} labelClassName="min-w-[55%]" small />
      </div>
    </div>
  )
}
