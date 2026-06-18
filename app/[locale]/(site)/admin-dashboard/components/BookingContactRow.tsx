"use client"

import { FaDiscord, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa"
import { FiMail } from "react-icons/fi"
import { useScopedI18n } from "@/locales/client"

export function BookingContactRow({
  contact,
  contactType,
}: {
  contact: string | null | undefined
  contactType: string | null | undefined
}) {
  const t = useScopedI18n("admin")
  const contactValue = contact ?? t("notProvided")

  const ContactIcon =
    contactType === "telegram"
      ? FaTelegramPlane
      : contactType === "discord"
        ? FaDiscord
        : contactType === "linkedin"
          ? FaLinkedinIn
          : FiMail

  const iconClassName =
    contactType === "telegram"
      ? "text-[#2AABEE]"
      : contactType === "discord"
        ? "text-[#8ea2ff]"
        : contactType === "linkedin"
          ? "text-[#0A66C2]"
          : "text-[#d6d8db]"

  return (
    <div className="flex items-center gap-xs overflow-hidden text-xs">
      <ContactIcon className={`shrink-0 ${iconClassName}`} size={13} />
      <p className="truncate whitespace-nowrap text-secondary" title={`${t("contact")}: ${contactValue}`}>
        {t("contact")}: {contactValue}
      </p>
    </div>
  )
}
