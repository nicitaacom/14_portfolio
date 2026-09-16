"use client"

import { useScopedI18n } from "@/locales/client"

export function BookingContactRow({ contact, contactType }: {
  contact: string | null | undefined
  contactType: string | null | undefined
}) {
  const t = useScopedI18n("adminConsole")
  return (
    <p className="my-sm [overflow-wrap:anywhere]">
      <span className="text-[var(--3d-dot-c-a1a7ae)]">{t("contact")}{contactType ? " · " + contactType : ""}: </span>
      <span>{contact || t("notProvided")}</span>
    </p>
  )
}
