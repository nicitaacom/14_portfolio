"use client"

import { Button } from "@/components/Button"
import { useScopedI18n } from "@/locales/client"
import { useIsGMLive } from "@/store/useIsGMLive"

export function IsGMLive() {
  const { isGMLive } = useIsGMLive()
  const t = useScopedI18n("appointment.page")
  const commonT = useScopedI18n("common")
  return (
    <>
      {isGMLive && (
        <>
          <Button className="font-bold" href="https://meet.google.com/yiy-pbnd-ygo" target="_blank">
            {t("joinGoogleMeetsNow")}
          </Button>
          <span>{commonT("or")}</span>
        </>
      )}
    </>
  )
}
