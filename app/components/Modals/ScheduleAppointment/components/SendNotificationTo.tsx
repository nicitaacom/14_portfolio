"use client"

import { twMerge } from "tailwind-merge"
import { FieldErrors, UseFormRegister, UseFormSetError } from "react-hook-form"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { SendNotificationToSwitcher } from "./SendNotificctionToDropdown/SendNotificationToSwitcher"
import { AppointmentFormData, FormInput } from "../../../../[locale]/(site)/appointment/components/FormInput"
import { useScopedI18n } from "@/locales/client"

interface SendNotificationToProps {
  errors: FieldErrors<AppointmentFormData>
  register: UseFormRegister<AppointmentFormData>
  setError: UseFormSetError<AppointmentFormData>
}

export function SendNotificationTo({ errors, register }: SendNotificationToProps) {
  const { sendNotificationTo } = useAppointmentStore()
  const t = useScopedI18n("appointment.modal")

  return (
    <div className="flex w-full flex-col gap-xs">
      <div className="flex w-full flex-col gap-xs tablet:flex-row">
        <SendNotificationToSwitcher />
        <FormInput
          className={twMerge(
            "h-[40px] rounded-[10px] bg-transparent px-sm py-xs font-normal text-secondary",
            errors["inputNotificationTo"] && "text-danger",
          )}
          id="inputNotificationTo"
          errors={errors}
          register={register}
          placeholder={
            sendNotificationTo === "tg"
              ? t("reminderPlaceholderTelegram")
              : sendNotificationTo === "dis"
                ? t("reminderPlaceholderDiscord")
                : t("reminderPlaceholderEmail")
          }
        />
      </div>
    </div>
  )
}
