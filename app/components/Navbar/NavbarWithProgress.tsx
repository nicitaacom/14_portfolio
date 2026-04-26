"use client"

import Link from "next/link"
import { NavbarProjects } from "./NavbarProjects"
import { useEffect, useState } from "react"
import { useIsGMLive } from "@/store/useIsGMLive"
import { AdminDropdown } from "./AdminDropdown"
import { LanguageDropdown } from "./LanguageDropdown"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"

interface NavbarWithProgressProps {
  userId: string | undefined
  is_live_call: boolean
}

export function NavbarWithProgress({ userId, is_live_call }: NavbarWithProgressProps) {
  const [scrollRef, setScrollRef] = useState<React.RefObject<HTMLDivElement> | null>(null)
  const [progress, setProgress] = useState(0)
  const locale = useCurrentLocale()
  const t = useScopedI18n("common")

  const { setIsGMLive } = useIsGMLive()
  useEffect(() => {
    setIsGMLive(is_live_call)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const updateProgress = () => {
      if (scrollRef?.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const maxScroll = scrollWidth - clientWidth
        const currentProgress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
        setProgress(currentProgress)
      }
    }

    updateProgress()
    const interval = setInterval(updateProgress, 100)
    return () => clearInterval(interval)
  }, [scrollRef])

  return (
    <nav
      className="w-full flex justify-between transition-[height] gap-x-sm duration-[600ms] px-md
      text-secondary bg-primary-foreground"
      style={{
        borderBottom: `2px solid #c4c4c4`,
        borderImage: `linear-gradient(to right, hsl(var(--cta)) ${progress}%, #c4c4c4 ${progress}%) 1`,
        overflow: "visible",
      }}>
      <div className="flex items-center pr-md line">
        <Link
          data-text="Portfolio"
          href={localizePath("/", locale)}
          className="text-shadow text-lg text-secondary before:text-secondary">
          {t("portfolio")}
        </Link>
      </div>
      <NavbarProjects setScrollRef={setScrollRef} />
      <div className="flex items-center gap-x-sm pl-xs overflow-visible shrink-0 navbar-right-shadow">
        <LanguageDropdown />
        {userId && (
          <>
            <div className="hidden desktop:inline-flex h-[calc(66px-24px)] mt-[12px] border-r-2 border-[#909090]"></div>
            <AdminDropdown isGMLive={is_live_call} />
          </>
        )}
      </div>
    </nav>
  )
}
