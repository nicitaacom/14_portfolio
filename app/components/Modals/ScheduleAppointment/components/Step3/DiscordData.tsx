"use client"

import { formatedDateTimeFn } from "../../../../../[locale]/(site)/functions/formatedDateTimeFn"
import Link from "next/link"
import { FaDiscord } from "react-icons/fa"
import { useScopedI18n } from "@/locales/client"

export function DiscordData() {
  const t = useScopedI18n("appointment.modal")
  const commonT = useScopedI18n("common")

  return (
    <div className="w-full rounded-[12px] border border-brass/40 px-sm py-xs">
      <div className="flex items-start gap-xs">
        <FaDiscord className="mt-[2px] text-cta" size={16} />
        <div className="flex flex-col gap-[4px]">
          <p className="text-sm text-secondary">{commonT("discord")}</p>
          <p className="text-sm leading-relaxed text-secondary-foreground">{t("reachMeOnDiscord")}</p>
          <Link className="w-fit text-sm text-cta" href="https://discord.com/users/780002958380498955" target="_blank">
            {commonT("discord")}
          </Link>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            {t("callMeOnDiscord", { dateTime: formatedDateTimeFn().trim() })}
          </p>
        </div>
      </div>
    </div>
  )
}
