import { SetupNotification } from "./SetupNotification"
import { GoogleMeetsData } from "./GoogleMeetsData"
import { DoneButton } from "./DoneButton"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { DiscordData } from "./DiscordData"
import { TelegramData } from "./TelegramData"
import { formatedDateTimeFn } from "@/(site)/functions/formatedDateTimeFn"

export function Step3() {
  const { channel } = useAppointmentStore()

  return (
    <div className="flex w-full flex-col items-center gap-sm pt-xs">
      <div className="w-full rounded-[12px] border border-cta/40 px-sm py-sm">
        <p className="text-sm font-bold text-secondary">Appointment booked</p>
        <p className="mt-[2px] text-sm text-secondary-foreground">{formatedDateTimeFn().trim()}</p>
        <p className="mt-[2px] text-xs text-secondary-foreground capitalize">Channel: {channel?.replace("-", " ")}</p>
      </div>

      <SetupNotification />
      {channel === "google-meets" && <GoogleMeetsData />}
      {channel === "discord" && <DiscordData />}
      {channel === "telegram" && <TelegramData />}
      <DoneButton />
    </div>
  )
}
