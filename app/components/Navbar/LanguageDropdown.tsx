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
          "flex h-[38px] min-w-[176px] items-center justify-between gap-sm rounded-[12px] border border-[#3b3b3b] bg-[#232323] px-md shadow-[0_8px_22px_rgba(0,0,0,0.14)] transition-all duration-200 hover:border-cta/70 hover:bg-[#292929]",
          isOpen && "border-cta/70 bg-[#292929]",
        )}
        onClick={() => setIsOpen(prevState => !prevState)}
        type="button">
        <div className="flex min-w-0 items-center gap-xs">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#4a4a4a] bg-[#2b2b2b]">
            <TbWorld className="text-secondary-foreground" size={13} />
          </span>
          <span className="truncate text-sm text-secondary">{t(currentLanguage.code)}</span>
        </div>
        <BiSolidDownArrow
          className={twMerge(
            "shrink-0 text-[11px] text-secondary-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-secondary",
          )}
        />
      </button>

      <div
        className={twMerge(
          "absolute left-0 top-[calc(100%+10px)] z-[120] min-w-full rounded-[14px] border border-[#3b3b3b] bg-[#242424] p-[6px] shadow-[0_16px_40px_rgba(0,0,0,0.24)] transition-all duration-200",
          isOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-[-8px] opacity-0 pointer-events-none",
        )}>
        <div className="flex flex-col gap-xs">
          {languages.map(language => (
            <button
              key={language.code}
              className={twMerge(
                "flex h-[38px] items-center justify-between gap-sm whitespace-nowrap rounded-[10px] border border-[#3b3b3b] bg-[#1f1f1f] px-sm text-sm text-secondary transition-colors duration-200 hover:border-cta/60 hover:bg-[#292929]",
                language.code === locale && "border-cta/70 bg-[#292929]",
              )}
              onClick={() => changeLanguage(language.code)}
              type="button">
              <span>{t(language.code)}</span>
              {language.code === locale ? <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-cta" /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
