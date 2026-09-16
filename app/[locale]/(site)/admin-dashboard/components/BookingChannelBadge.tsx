"use client"

import { useScopedI18n } from "@/locales/client"

export function BookingChannelBadge({ channel }: { channel: string }) {
  const t = useScopedI18n("common")
  const label = channel === "telegram" ? t("telegram") : channel === "discord" ? t("discord") : channel === "google-meets" ? t("googleMeets") : channel
  return <span className="inline-flex w-fit items-center rounded border border-[var(--3d-dot-c-45525d)] bg-[var(--3d-dot-c-202930)] px-xs py-xs font-typewriter text-[9px] leading-4 text-[var(--3d-dot-c-b7c4cf)]">{label}</span>
}
