"use client"

import { twMerge } from "tailwind-merge"
import { FieldErrors, UseFormRegister, UseFormSetError } from "react-hook-form"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { SendNotificationToSwitcher } from "./SendNotificctionToDropdown/SendNotificationToSwitcher"
import { AppointmentFormData, FormInput } from "@/(site)/appointment/components/FormInput"

interface SendNotificationToProps {
  errors: FieldErrors<AppointmentFormData>
  register: UseFormRegister<AppointmentFormData>
  setError: UseFormSetError<AppointmentFormData>
}

export function SendNotificationTo({ errors, register }: SendNotificationToProps) {
  const { sendNotificationTo } = useAppointmentStore()

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
            sendNotificationTo === "tg" ? "Telegram username" : sendNotificationTo === "dis" ? "Discord username" : "Email address"
          }
        />
      </div>
    </div>
  )
}
