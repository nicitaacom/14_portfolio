import { SetupNotification } from "./SetupNotification"
import { GoogleMeetsData } from "./GoogleMeetsData"
import { DoneButton } from "./DoneButton"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { DiscordData } from "./DiscordData"
import { TelegramData } from "./TelegramData"

export function Step3() {
  const { channel } = useAppointmentStore()

  return (
    <div className="w-full flex flex-col items-center gap-y-md pt-lg">
      <SetupNotification />
      {channel === "google-meets" && <GoogleMeetsData />}
      {channel === "discord" && <DiscordData />}
      {channel === "telegram" && <TelegramData />}
      <DoneButton />
    </div>
  )
}
