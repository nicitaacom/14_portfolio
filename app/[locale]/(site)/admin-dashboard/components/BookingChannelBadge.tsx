"use client"

import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { SiGooglemeet } from "react-icons/si"
import { useScopedI18n } from "@/locales/client"

export function BookingChannelBadge({ channel }: { channel: string }) {
  const commonT = useScopedI18n("common")

  if (channel === "telegram") {
    return (
      <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#2AABEE]/40 bg-[#102d3c] px-sm py-[2px] text-xs text-[#7fd3ff]">
        <FaTelegramPlane size={12} />
        {commonT("telegram")}
      </span>
    )
  }

  if (channel === "discord") {
    return (
      <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#5865F2]/40 bg-[#1c214c] px-sm py-[2px] text-xs text-[#a9b8ff]">
        <FaDiscord size={12} />
        {commonT("discord")}
      </span>
    )
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[2px] border border-[#4b4f56] bg-[#2a2d31] px-sm py-[2px] text-xs text-[#f1f3f4]">
      <SiGooglemeet className="text-[#34A853]" size={12} />
      {commonT("googleMeets")}
    </span>
  )
}
