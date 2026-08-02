"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { BiSolidDownArrow } from "react-icons/bi"
import { twMerge } from "tailwind-merge"

import { GMCheckbox } from "@/(site)/appointment/components/GMCheckbox"
import { useCloseOnEsc } from "@/hooks/useCloseOnEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"

interface AdminDropdownProps {
  isGMLive: boolean
}

export function AdminDropdown({ isGMLive }: AdminDropdownProps) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const [isShowDropdown, setIsShowDropdown] = useState(false)
  const locale = useCurrentLocale()
  const t = useScopedI18n("navbar")

  function closeDropdown() {
    setIsShowDropdown(false)
  }

  function toggleDropdown() {
    setIsShowDropdown(!isShowDropdown)
  }

  useCloseOnEsc(closeDropdown)
  useCloseOnClickOutside(dropdownContainerRef, closeDropdown)

  return (
    <div className="site-admin-picker relative flex w-[132px] justify-center" ref={dropdownContainerRef}>
      <button
        className={twMerge(
          "site-admin-trigger machine-face relative flex h-[36px] w-[132px] items-center justify-center rounded-[6px] px-sm transition-all duration-300 hover:border-cta hover:brightness-110",
          isShowDropdown && "border-cta brightness-110",
        )}
        onClick={toggleDropdown}
        type="button">
        <span className="text-sm text-secondary">{t("panel")}</span>
        <BiSolidDownArrow
          className={twMerge(
            "absolute right-sm text-brass/80 transition-transform duration-300",
            isShowDropdown && "rotate-180 text-secondary",
          )}
        />
      </button>

      <div
        className={twMerge(
          "site-admin-menu machine-face absolute left-1/2 top-[calc(100%+14px)] z-[120] w-[214px] -translate-x-[58%] rounded-[6px] p-xs",
          isShowDropdown
            ? "visible opacity-100 transition-all duration-300"
            : "invisible opacity-0 transition-all duration-300",
        )}>
        <div className="flex flex-col gap-xs">
          <div className="site-admin-option machine-slot flex justify-center rounded-[10px] border border-transparent px-sm py-xs">
            <GMCheckbox isGMLive={isGMLive} />
          </div>

          <Link
            href={localizePath("/admin-dashboard", locale)}
            className="site-admin-option machine-slot flex h-[36px] items-center justify-center whitespace-nowrap rounded-[10px] border border-transparent px-sm text-sm text-secondary transition-colors duration-300 hover:border-cta hover:brightness-125">
            {t("openAdminDashboard")}
          </Link>
        </div>
      </div>
    </div>
  )
}
