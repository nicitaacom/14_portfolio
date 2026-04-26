"use client"

import { ScheduleButtons } from "./ScheduleButtons"
import { useScopedI18n } from "@/locales/client"

export function Step1() {
  const t = useScopedI18n("appointment.modal")

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-sm text-secondary-foreground">{t("pickOneOption")}</p>
      <ScheduleButtons />
    </div>
  )
}
