"use client"

import { Channel, useAppointmentStore } from "@/store/useAppointmentStore"
import { FaTelegramPlane } from "react-icons/fa"
import { FaDiscord } from "react-icons/fa"
import { SiGooglemeet } from "react-icons/si"
import { twMerge } from "tailwind-merge"
import { useScopedI18n } from "@/locales/client"

export function ScheduleButtons() {
  const { setNextStep, setChannel, setNextSendNotificationTo } = useAppointmentStore()
  const commonT = useScopedI18n("common")

  function setStepFn(channel: Channel) {
    setNextStep()
    setChannel(channel)
    if (channel === "discord") setNextSendNotificationTo()
  }

  const scheduleOptions = [
    {
      channel: "google-meets" as const,
      title: "Google Meets",
      icon: <SiGooglemeet size={28} className="text-cta" />,
    },
    {
      channel: "discord" as const,
      title: "Discord",
      icon: <FaDiscord size={28} className="text-cta" />,
    },
    {
      channel: "telegram" as const,
      title: "Telegram",
      icon: <FaTelegramPlane size={28} className="text-cta" />,
    },
  ]

  return (
    <div className="grid gap-xs">
      {scheduleOptions.map(option => (
        <button
          key={option.channel}
          className={twMerge(
            "appointment-choice flex items-center gap-sm px-sm py-sm text-left transition-[filter,border-color] duration-300",
          )}
          onClick={() => setStepFn(option.channel)}
          type="button">
          <div className="appointment-choice-icon flex h-[38px] w-[38px] items-center justify-center">
            {option.icon}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-sm">
            <span className="whitespace-nowrap text-sm font-bold text-secondary">{option.title}</span>
            <span className="shrink-0 whitespace-nowrap text-xs text-secondary-foreground">{commonT("continue")}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
