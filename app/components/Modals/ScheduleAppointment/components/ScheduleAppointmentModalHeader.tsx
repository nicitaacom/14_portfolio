"use client"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { PrevStepButton } from "./PrevStepButton"
import { SiGooglemeet } from "react-icons/si"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { useScopedI18n } from "@/locales/client"

export function ScheduleAppointmentModalHeader() {
  const { step, channel } = useAppointmentStore()
  const t = useScopedI18n("appointment.modal")
  const commonT = useScopedI18n("common")

  const headerText = step === "step-1" ? t("step1Title") : step === "step-2" ? t("step2Title") : t("step3Title")

  const helperText = step === "step-1" ? t("step1Helper") : step === "step-2" ? t("step2Helper") : t("step3Helper")

  const channelBadge =
    channel === "google-meets" ? (
      <>
        <SiGooglemeet />
        {commonT("googleMeets")}
      </>
    ) : channel === "discord" ? (
      <>
        <FaDiscord />
        {commonT("discord")}
      </>
    ) : channel === "telegram" ? (
      <>
        <FaTelegramPlane />
        {commonT("telegram")}
      </>
    ) : null

  return (
    <div className="appointment-modal-header relative flex w-full flex-col gap-xs border-b border-brass/40 pb-sm">
      {step !== "step-1" ? (
        <PrevStepButton disabled={step === "step-3"} />
      ) : (
        <span className="self-start whitespace-nowrap text-xs text-secondary-foreground">
          {t("stepLabel", { current: 1, total: 3 })}
        </span>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-xs">
          <h1 className="text-lg font-bold text-secondary">{headerText}</h1>
          {channelBadge && (
            <div className="appointment-channel-badge flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-full border border-brass/40 px-xs py-[3px] text-xs text-secondary-foreground">
              {channelBadge}
            </div>
          )}
        </div>
        <p className="mt-[2px] text-sm text-secondary-foreground">{helperText}</p>
      </div>
    </div>
  )
}
