"use client"

import { Button } from "@/components/Button"
import { useScopedI18n } from "@/locales/client"

export function IsGMLive({ isGMLive }: { isGMLive: boolean }) {
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
