"use client"

import { FiBell, FiBellOff } from "react-icons/fi"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { useScopedI18n } from "@/locales/client"

export function SetupNotification() {
  const { isSendNotification, sendNotificationTo, inputNotificationTo } = useAppointmentStore()
  const t = useScopedI18n("appointment.modal")
  const commonT = useScopedI18n("common")

  const destination =
    sendNotificationTo === "tg" ? commonT("telegram") : sendNotificationTo === "dis" ? commonT("discord") : commonT("email")

  return (
    <div className="w-full rounded-[12px] border border-[#777777] px-sm py-xs">
      {isSendNotification && inputNotificationTo.length > 3 ? (
        <div className="flex items-start gap-xs">
          <FiBell className="mt-[2px] text-cta" size={16} />
          <div>
            <p className="text-sm text-secondary">{t("reminderEnabled")}</p>
            <p className="text-sm text-secondary-foreground">{t("reminderEnabledText", { destination })}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-xs">
          <FiBellOff className="mt-[2px] text-secondary-foreground" size={16} />
          <div>
            <p className="text-sm text-secondary">{t("noReminder")}</p>
            <p className="text-sm text-secondary-foreground">{t("noReminderText")}</p>
          </div>
        </div>
      )}
    </div>
  )
}
