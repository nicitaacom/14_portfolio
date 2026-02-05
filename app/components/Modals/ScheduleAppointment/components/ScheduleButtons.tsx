"use client"

import { Button } from "@/components/Button"
import { Channel, useAppointmentStore } from "@/store/useAppointmentStore"
import { FaTelegramPlane } from "react-icons/fa"
import { FaDiscord } from "react-icons/fa"
import { SiGooglemeet } from "react-icons/si"

export function ScheduleButtons() {
  const { setNextStep, setChannel, setNextSendNotificationTo } = useAppointmentStore()

  function setStepFn(channel: Channel) {
    setNextStep()
    setChannel(channel)
    if (channel === "discord") setNextSendNotificationTo()
  }

  return (
    <div className="flex flex-col justify-around items-center gap-y-md gap-x-md pt-xs">
      <Button className="font-bold" onClick={() => setStepFn("google-meets")}>
        <SiGooglemeet />
        Google meets
      </Button>
      <Button className="font-bold" onClick={() => setStepFn("discord")}>
        <FaDiscord />
        Discord
      </Button>
      <Button className="font-bold" onClick={() => setStepFn("telegram")}>
        <FaTelegramPlane />
        Telegram
      </Button>
    </div>
  )
}
