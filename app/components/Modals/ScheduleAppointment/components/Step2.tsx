"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { twMerge } from "tailwind-merge"
import { IoMdArrowRoundForward } from "react-icons/io"
import { SiGooglemeet } from "react-icons/si"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"

import { Button } from "@/components/Button"
import { bookACallFn } from "../../../../[locale]/(site)/functions/bookACallFn"
import { AppointmentFormData } from "../../../../[locale]/(site)/appointment/components/FormInput"
import { formatedDateTimeFn } from "../../../../[locale]/(site)/functions/formatedDateTimeFn"
import useToast from "@/store/useToast"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import { Checkbox } from "./Checkbox"
import { ContactMethod } from "./ContactMethod"
import { SendNotificationTo } from "./SendNotificationTo"
import { useScopedI18n } from "@/locales/client"

const validationRules = {
  email: {
    required: "This field is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Enter valid email address",
    },
  },
  linkedin: {
    pattern: {
      value: /^https:\/\/www\.linkedin\.com\/in\/.+/i,
      message: "LinkedIn must start with https://www.linkedin.com/in/",
    },
  },
}

interface Step2Props {
  onBookingStateChange: (isBooking: boolean) => void
}

export function Step2({ onBookingStateChange }: Step2Props) {
  const router = useRouter()
  const toast = useToast()
  const t = useScopedI18n("appointment.modal")
  const formT = useScopedI18n("appointment.form")
  const pageT = useScopedI18n("appointment.page")
  const toastT = useScopedI18n("toast")
  const [isLoading, setIsLoading] = useState(false)
  const [showUpError, setShowUpError] = useState(false)

  const {
    channel,
    contactMethod,
    sendNotificationTo,
    isShowUpOnACall,
    isSendNotification,
    setContact,
    appointmentNote,
    step,
    setAppointmentNote,
    setInputNotificationTo,
    toggleIsShowUpOnACall,
    toggleIsSendNotification,
  } = useAppointmentStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AppointmentFormData>()

  const contactError = typeof errors.contact?.message === "string" ? errors.contact.message : null
  const notificationError =
    typeof errors.inputNotificationTo?.message === "string" ? errors.inputNotificationTo.message : null

  const channelLabel =
    channel === "google-meets"
      ? "Google Meets"
      : channel === "discord"
        ? "Discord"
        : channel === "telegram"
          ? "Telegram"
          : ""

  const channelIcon =
    channel === "google-meets" ? (
      <SiGooglemeet className="text-cta" size={16} />
    ) : channel === "discord" ? (
      <FaDiscord className="text-cta" size={16} />
    ) : (
      <FaTelegramPlane className="text-cta" size={16} />
    )

  const onSubmit = async (data: AppointmentFormData) => {
    if (!isShowUpOnACall) {
      setShowUpError(true)
      return
    }

    if (!data.contact || data.contact.trim().length < 3) {
      setError("contact", { type: "manual", message: formT("required") })
      return
    }

    if (contactMethod === "email" && !validationRules.email.pattern.value.test(data.contact)) {
      setError("contact", { type: "manual", message: formT("emailInvalid") })
      return
    }

    if (contactMethod === "linkedin" && !validationRules.linkedin.pattern.value.test(data.contact)) {
      setError("contact", { type: "manual", message: formT("linkedinInvalid") })
      return
    }

    if (isSendNotification) {
      if (!data.inputNotificationTo || data.inputNotificationTo.trim().length < 3) {
        setError("inputNotificationTo", { type: "manual", message: formT("required") })
        return
      }

      if (sendNotificationTo === "email" && !validationRules.email.pattern.value.test(data.inputNotificationTo)) {
        setError("inputNotificationTo", { type: "manual", message: formT("emailInvalid") })
        return
      }
    }

    setContact(data.contact.trim())
    setInputNotificationTo(isSendNotification ? data.inputNotificationTo.trim() : "")

    try {
      setIsLoading(true)
      onBookingStateChange(true)
      const stepBefore = useAppointmentStore.getState().step
      await bookACallFn({
        chooseChannelFirst: t("chooseChannelFirst"),
        dailyLimitReached: () => t("dailyLimitReached", { message: pageT("dailyLimit", { count: 2 }) }),
        errorTitle: toastT("defaultErrorTitle"),
      })
      if (useAppointmentStore.getState().step !== stepBefore) {
        router.refresh()
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.show("error", toastT("defaultErrorTitle"), error.message)
      }
    } finally {
      setIsLoading(false)
      onBookingStateChange(false)
    }
  }

  return (
    <form
      className={twMerge(
        "appointment-details-panel flex w-full flex-col gap-sm p-sm",
        step === "step-1" ? "" : "pt-sm",
      )}
      onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-xs rounded-[12px] border border-brass/40 px-sm py-xs">
        <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-cta/40 bg-cta/10">
          {channelIcon}
        </div>
        <div className="min-w-0">
          <p className="whitespace-nowrap text-sm text-secondary">{channelLabel}</p>
          <p className="truncate text-xs text-secondary-foreground">{formatedDateTimeFn().trim()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <label className="text-sm text-secondary" htmlFor="contact">
          {t("contactLabel")} <span className="text-danger">*</span>
        </label>
        <ContactMethod register={register} errors={errors} />
        {contactError && <p className="text-sm text-danger">{contactError}</p>}
      </div>

      <Checkbox
        className={twMerge(showUpError && !isShowUpOnACall && "border-danger bg-danger/5")}
        isChecked={isShowUpOnACall}
        onChange={() => {
          setShowUpError(false)
          toggleIsShowUpOnACall()
        }}
        label={t("showUpLabel")}
      />
      {showUpError && !isShowUpOnACall && <p className="text-sm text-danger">{t("showUpError")}</p>}

      <div className="flex flex-col gap-xs">
        <Checkbox isChecked={isSendNotification} onChange={toggleIsSendNotification} label={t("sendReminderLabel")} />

        {isSendNotification && (
          <div className="flex flex-col gap-xs pl-[10px]">
            <SendNotificationTo register={register} errors={errors} setError={setError} />
            {notificationError && <p className="text-sm text-danger">{notificationError}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-xs">
        <label className="text-sm text-secondary-foreground" htmlFor="appointmentNote">
          {t("noteLabel")}
        </label>
        <textarea
          id="appointmentNote"
          className="min-h-[104px] rounded-[10px] border border-secondary-foreground/40 bg-primary-foreground/15 px-sm py-sm text-secondary outline-none transition-colors duration-300 placeholder:text-secondary-foreground/55 focus:border-secondary-foreground"
          value={appointmentNote}
          onChange={e => setAppointmentNote(e.target.value)}
          placeholder={t("notePlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-xs pt-xs tablet:flex-row tablet:items-center tablet:justify-between">
        <p className="text-xs text-secondary-foreground">{t("stepLabel", { current: 2, total: 3 })}</p>
        <Button
          className={twMerge(
            "group flex w-full flex-row gap-x-xs rounded-[12px] border-cta px-md py-xs font-bold tablet:w-fit",
            (!isShowUpOnACall || isLoading) && "cursor-default opacity-50",
          )}
          disabled={!isShowUpOnACall || isLoading}
          requestAction
          requestPending={isLoading}
          type="submit">
          {isLoading ? t("booking") : t("bookCall")}
          <IoMdArrowRoundForward className="duration-300 group-hover:-translate-x-0.5" />
        </Button>
      </div>
    </form>
  )
}
