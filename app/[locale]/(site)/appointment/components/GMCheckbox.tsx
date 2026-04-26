"use client"

import { GMLiveCheckbox } from "./GMLiveCheckbox"
import { useScopedI18n } from "@/locales/client"

export function GMCheckbox({ isGMLive }: { isGMLive: boolean }) {
  const t = useScopedI18n("navbar")

  return (
    <div className="flex flex-row justify-center items-center gap-x-xs">
      <div className="relative tooltip">
        <p className="font-bold">{t("gmLive")}</p>
        <p className="tooltiptext w-[219px] top-[450%] left-[10%]">{t("gmLiveTooltip")}</p>
      </div>
      <GMLiveCheckbox isGMLive={!!isGMLive} />
    </div>
  )
}
