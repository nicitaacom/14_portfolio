import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { PiEnvelopeSimpleFill } from "react-icons/pi"

import { useAppointmentStore } from "@/store/useAppointmentStore"

export function DropdownContainerContent() {
  const { sendNotificationTo, setNextSendNotificationTo } = useAppointmentStore()
  return (
    <button
      className="flex h-full w-full items-center justify-center rounded-[10px] bg-transparent transition-colors duration-300 hover:bg-primary-foreground/20"
      onClick={setNextSendNotificationTo}
      type="button">
      {sendNotificationTo === "tg" ? (
        <FaTelegramPlane size={16} />
      ) : sendNotificationTo === "dis" ? (
        <FaDiscord size={16} />
      ) : (
        <PiEnvelopeSimpleFill size={16} />
      )}
    </button>
  )
}
