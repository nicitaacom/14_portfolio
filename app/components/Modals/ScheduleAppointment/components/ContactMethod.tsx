"use client"

import { twMerge } from "tailwind-merge"
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"
import { FaDiscord, FaTelegramPlane, FaLinkedinIn } from "react-icons/fa"
import { PiEnvelopeSimpleFill } from "react-icons/pi"

import { useAppointmentStore } from "@/store/useAppointmentStore"
import { FormInput } from "@/(site)/appointment/components/FormInput"

interface FormData {
  contact: string
}

interface ContactMethodProps {
  errors: FieldErrors<FieldValues>
  register: UseFormRegister<FormData>
}

export function ContactMethod({ errors, register }: ContactMethodProps) {
  const { contactMethod, setNextContactMethod } = useAppointmentStore()

  const placeholder =
    contactMethod === "telegram"
      ? "Telegram username"
      : contactMethod === "discord"
        ? "Discord username"
        : contactMethod === "linkedin"
        ? "LinkedIn profile or username"
        : "Email"

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
          className="flex h-[40px] w-full items-center justify-center gap-xs rounded-[10px] border border-[#777777] px-sm text-secondary transition-colors duration-300 hover:border-cta hover:text-secondary tablet:w-[132px]"
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
