"use client"

import { SetupNotification } from "./SetupNotification"
import { GoogleMeetsData } from "./GoogleMeetsData"
import { DoneButton } from "./DoneButton"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { DiscordData } from "./DiscordData"
import { TelegramData } from "./TelegramData"
import { formatedDateTimeFn } from "../../../../../[locale]/(site)/functions/formatedDateTimeFn"
import { useScopedI18n } from "@/locales/client"

export function Step3() {
  const { channel } = useAppointmentStore()
  const t = useScopedI18n("appointment.modal")
  const commonT = useScopedI18n("common")

  return (
    <div className="appointment-details-panel flex w-full flex-col items-center gap-sm p-sm">
      <div className="w-full rounded-[12px] border border-cta/40 px-sm py-sm">
        <p className="text-sm font-bold text-secondary">{t("appointmentBooked")}</p>
        <p className="mt-[2px] text-sm text-secondary-foreground">{formatedDateTimeFn().trim()}</p>
        <p className="mt-[2px] text-xs text-secondary-foreground capitalize">
          {commonT("channel")}: {channel?.replace("-", " ")}
        </p>
      </div>

      <SetupNotification />
      {channel === "google-meets" && <GoogleMeetsData />}
      {channel === "discord" && <DiscordData />}
      {channel === "telegram" && <TelegramData />}
      <DoneButton />
    </div>
  )
}
