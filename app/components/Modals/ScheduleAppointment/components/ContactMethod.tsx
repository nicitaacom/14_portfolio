"use client"

import { twMerge } from "tailwind-merge"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import { FaDiscord, FaTelegramPlane, FaLinkedinIn } from "react-icons/fa"
import { PiEnvelopeSimpleFill } from "react-icons/pi"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { AppointmentFormData, FormInput } from "../../../../[locale]/(site)/appointment/components/FormInput"
import { useScopedI18n } from "@/locales/client"

interface ContactMethodProps {
  errors: FieldErrors<AppointmentFormData>
  register: UseFormRegister<AppointmentFormData>
}

export function ContactMethod({ errors, register }: ContactMethodProps) {
  const { contactMethod, setNextContactMethod } = useAppointmentStore()
  const t = useScopedI18n("appointment.modal")

  const placeholder =
    contactMethod === "telegram"
      ? t("contactPlaceholderTelegram")
      : contactMethod === "discord"
        ? t("contactPlaceholderDiscord")
        : contactMethod === "linkedin"
          ? t("contactPlaceholderLinkedIn")
          : t("contactPlaceholderEmail")

  const icon =
    contactMethod === "telegram" ? (
      <FaTelegramPlane size={16} />
    ) : contactMethod === "discord" ? (
      <FaDiscord size={16} />
    ) : contactMethod === "linkedin" ? (
      <FaLinkedinIn size={16} />
    ) : (
      <PiEnvelopeSimpleFill size={16} />
    )

  return (
    <div className="flex w-full flex-col gap-xs">
      <div className="flex w-full flex-col gap-xs tablet:flex-row">
        <button
          className="flex h-[40px] w-full items-center justify-center gap-xs rounded-[10px] border border-brass/40 px-sm text-secondary transition-colors duration-300 hover:border-cta hover:text-secondary tablet:w-[132px]"
          onClick={setNextContactMethod}
          type="button">
          {icon}
          <span className="text-sm capitalize text-secondary">{contactMethod}</span>
        </button>

        <FormInput
          className={twMerge(
            "h-[40px] rounded-[10px] bg-transparent px-sm py-xs font-normal text-secondary",
            errors["contact"] && "text-danger",
          )}
          id="contact"
          errors={errors}
          register={register}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
