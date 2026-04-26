"use client"

import { useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { BiSolidDownArrow } from "react-icons/bi"
import { TbWorld } from "react-icons/tb"
import { twMerge } from "tailwind-merge"

import { languages } from "@/data/languages"
import { TLocale } from "@/locales/config"
import { NEXT_LOCALE_COOKIE_NAME, getLocalizedPathname } from "@/locales/helpers"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { useCloseOnClickEsc } from "@/hooks/useOnClickEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"

export function LanguageDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useCurrentLocale()
  const t = useScopedI18n("languages")

  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(language => language.code === locale) ?? languages[0]

  useCloseOnClickOutside(dropdownContainerRef, () => setIsOpen(false))
  useCloseOnClickEsc(() => setIsOpen(false))

  function changeLanguage(nextLocale: TLocale) {
    if (nextLocale === locale) {
      setIsOpen(false)
      return
    }

    document.cookie = `${NEXT_LOCALE_COOKIE_NAME}=${nextLocale}; path=/; samesite=lax`

    const nextSearch = searchParams?.toString()
    const nextUrl = getLocalizedPathname(pathname || "/", nextLocale, nextSearch ? `?${nextSearch}` : "")

    router.replace(nextUrl)
    router.refresh()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownContainerRef}>
      <button
        className={twMerge(
          "relative flex h-[36px] w-[152px] items-center justify-center gap-[6px] rounded-[10px] border border-[#3b3b3b] bg-[#232323] px-sm transition-all duration-300 hover:border-cta hover:bg-[#292929]",
          isOpen && "border-cta bg-[#292929]",
        )}
        onClick={() => setIsOpen(prevState => !prevState)}
        type="button">
        <TbWorld className="text-secondary-foreground" size={16} />
        <span className="truncate text-sm text-secondary">{t(currentLanguage.code)}</span>
        <BiSolidDownArrow
          className={twMerge(
            "absolute right-sm text-secondary-foreground transition-transform duration-300",
            isOpen && "rotate-180 text-secondary",
          )}
        />
      </button>

      <div
        className={twMerge(
          "absolute left-1/2 top-[calc(100%+14px)] z-[120] w-[152px] -translate-x-1/2 rounded-[12px] border border-[#3b3b3b] bg-[#242424] p-xs transition-all duration-300",
          isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}>
        <div className="flex flex-col gap-xs">
          {languages.map(language => (
            <button
              key={language.code}
              className={twMerge(
                "flex h-[36px] items-center justify-center whitespace-nowrap rounded-[10px] border border-[#3b3b3b] bg-[#1f1f1f] px-sm text-sm text-secondary transition-colors duration-300 hover:border-cta hover:bg-[#292929]",
                language.code === locale && "border-cta bg-[#292929]",
              )}
              onClick={() => changeLanguage(language.code)}
              type="button">
              {t(language.code)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
