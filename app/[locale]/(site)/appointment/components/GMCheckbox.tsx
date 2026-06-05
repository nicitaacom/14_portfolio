"use client"

import { GMLiveCheckbox } from "./GMLiveCheckbox"
import { useScopedI18n } from "@/locales/client"

export function GMCheckbox({ isGMLive }: { isGMLive: boolean }) {
  const t = useScopedI18n("navbar")

  return (
    <div className="flex flex-row justify-center items-center gap-x-xs">
      <div className="tooltip-b">
        <p className="font-bold">{t("gmLive")}</p>
        <p className="tooltiptext-b w-[219px]">{t("gmLiveTooltip")}</p>
      </div>
      <GMLiveCheckbox isGMLive={!!isGMLive} />
    </div>
  )
}
