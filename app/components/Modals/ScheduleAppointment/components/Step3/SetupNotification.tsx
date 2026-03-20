import { FiBell, FiBellOff } from "react-icons/fi"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { tooltip } from "@/utils/tooltip"

export function SetupNotification() {
  const { isSendNotification, sendNotificationTo, inputNotificationTo } = useAppointmentStore()

  return (
    <div className="w-full rounded-[12px] border border-[#777777] px-sm py-xs">
      {isSendNotification && inputNotificationTo.length > 3 ? (
        <div className="flex items-start gap-xs">
          <FiBell className="mt-[2px] text-cta" size={16} />
          <div>
            <p className="text-sm text-secondary">Reminder enabled</p>
            <p className="text-sm text-secondary-foreground">
              Notification in {sendNotificationTo} with the {tooltip("GM", "Google meets")} link 10 minutes before.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-xs">
          <FiBellOff className="mt-[2px] text-secondary-foreground" size={16} />
          <div>
            <p className="text-sm text-secondary">No reminder</p>
            <p className="text-sm text-secondary-foreground">This booking will not send an automatic reminder.</p>
          </div>
        </div>
      )}
    </div>
  )
}
