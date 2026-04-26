"use client"

import Link from "next/link"
import { useRef } from "react"
import { BiSolidDownArrow } from "react-icons/bi"
import { twMerge } from "tailwind-merge"

import { GMCheckbox } from "@/(site)/appointment/components/GMCheckbox"
import { useCloseOnClickEsc } from "@/hooks/useOnClickEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"
import { useNavbarAdminDropdown } from "@/store/useNavbarAdminDropdown"

interface AdminDropdownProps {
  isGMLive: boolean
}

export function AdminDropdown({ isGMLive }: AdminDropdownProps) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const { isShowDropdown, setIsShowDropdown } = useNavbarAdminDropdown()
  const locale = useCurrentLocale()
  const t = useScopedI18n("navbar")

  function closeDropdown() {
    setIsShowDropdown(false)
  }

  function toggleDropdown() {
    setIsShowDropdown(!isShowDropdown)
  }

  useCloseOnClickEsc(closeDropdown)
  useCloseOnClickOutside(dropdownContainerRef, closeDropdown)

  return (
    <div className="relative flex w-[132px] justify-center" ref={dropdownContainerRef}>
      <button
        className={twMerge(
          "relative flex h-[36px] w-[132px] items-center justify-center rounded-[10px] border border-[#3b3b3b] bg-[#232323] px-sm transition-all duration-300 hover:border-cta hover:bg-[#292929]",
          isShowDropdown && "border-cta bg-[#292929]",
        )}
        onClick={toggleDropdown}
        type="button">
        <span className="text-sm text-secondary">{t("panel")}</span>
        <BiSolidDownArrow
          className={twMerge(
            "absolute right-sm text-secondary-foreground transition-transform duration-300",
            isShowDropdown && "rotate-180 text-secondary",
          )}
        />
      </button>

      <div
        className={twMerge(
          "absolute left-1/2 top-[calc(100%+14px)] z-[120] w-[214px] -translate-x-[58%] rounded-[12px] border border-[#3b3b3b] bg-[#242424] p-xs shadow-[0_18px_40px_rgba(0,0,0,0.34)]",
          isShowDropdown
            ? "visible opacity-100 transition-all duration-300"
            : "invisible opacity-0 transition-all duration-300",
        )}>
        <div className="flex flex-col gap-xs">
          <div className="flex justify-center rounded-[10px] border border-[#333333] bg-[#1f1f1f] px-sm py-xs">
            <GMCheckbox isGMLive={isGMLive} />
          </div>

          <Link
            href={localizePath("/admin-dashboard", locale)}
            className="flex h-[36px] items-center justify-center whitespace-nowrap rounded-[10px] border border-[#3b3b3b] bg-[#1f1f1f] px-sm text-sm text-secondary transition-colors duration-300 hover:border-cta hover:bg-[#292929]">
            {t("openAdminDashboard")}
          </Link>
        </div>
      </div>
    </div>
  )
}
