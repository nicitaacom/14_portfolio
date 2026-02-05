"use client"

import { twMerge } from "tailwind-merge"
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetError } from "react-hook-form"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { SendNotificationToSwitcher } from "./SendNotificctionToDropdown/SendNotificationToSwitcher"
import { FormInput } from "@/(site)/appointment/components/FormInput"

interface FormData {
  inputNotificationTo: string
}

interface SendNotificationToProps {
  errors: FieldErrors<FieldValues>
  register: UseFormRegister<FormData>
  setError: UseFormSetError<FormData>
}

export function SendNotificationTo({ errors, register }: SendNotificationToProps) {
  const { sendNotificationTo } = useAppointmentStore()

  return (
    <div className="flex flex-row justify-center items-center gap-x-xs">
      <div className="flex flex-row justify-center">
        <SendNotificationToSwitcher />
        <FormInput
          className={twMerge(
            "h-[26px] w-[150px] rounded-none px-[2px] outline-none font-normal",
            errors["inputNotificationTo"] && "text-danger",
          )}
          id="inputNotificationTo"
          errors={errors}
          register={register}
          placeholder={sendNotificationTo === "tg" ? "Telegram" : sendNotificationTo === "dis" ? "Discord" : "Email"}
        />
      </div>
    </div>
  )
}
