"use client"

import { formatedDateTimeFn } from "../../../../../[locale]/(site)/functions/formatedDateTimeFn"
import Link from "next/link"
import { FaTelegramPlane } from "react-icons/fa"
import { useScopedI18n } from "@/locales/client"

export function TelegramData() {
  const t = useScopedI18n("appointment.modal")
  const commonT = useScopedI18n("common")

  return (
    <div className="w-full rounded-[12px] border border-[#777777] px-sm py-xs">
      <div className="flex items-start gap-xs">
        <FaTelegramPlane className="mt-[2px] text-cta" size={16} />
        <div className="flex flex-col gap-[4px]">
          <p className="text-sm text-secondary">{commonT("telegram")}</p>
          <p className="text-sm leading-relaxed text-secondary-foreground">{t("reachMeOnTelegram")}</p>
          <Link className="w-fit text-sm text-cta" href="https://t.me/nicitaacom" target="_blank">
            {commonT("telegram")}
          </Link>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            {t("callMeOnTelegram", { dateTime: formatedDateTimeFn().trim() })}
          </p>
        </div>
      </div>
    </div>
  )
}
