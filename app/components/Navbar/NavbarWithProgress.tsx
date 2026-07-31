"use client"

import Link from "next/link"
import { NavbarProjects } from "./NavbarProjects"
import { useEffect, useState } from "react"
import { useIsGMLive } from "@/store/useIsGMLive"
import { AdminDropdown } from "./AdminDropdown"
import { LanguageDropdown } from "./LanguageDropdown"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"
import { HalloweenFrameOrnaments } from "@/components/Halloween/HalloweenFrameOrnaments"

interface NavbarWithProgressProps {
  userId: string | undefined
  is_live_call: boolean
}

export function NavbarWithProgress({ userId, is_live_call }: NavbarWithProgressProps) {
  const [scrollRef, setScrollRef] = useState<React.RefObject<HTMLDivElement | null> | null>(null)
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
      className="site-navbar navbar-plate new-year-navbar-shell relative w-full flex justify-between transition-[height] gap-x-sm duration-[600ms]
      px-md text-secondary overflow-visible">
      <HalloweenFrameOrnaments variant="navbar" />
      <div className="navbar-left-shadow flex items-center pr-md line">
        <Link
          data-text="Portfolio"
          href={localizePath("/", locale)}
          className="text-shadow navbar-engraved text-lg text-secondary before:text-secondary">
          {t("portfolio")}
        </Link>
      </div>
      <NavbarProjects progress={progress} setScrollRef={setScrollRef} />
      <div className="flex items-center gap-x-sm pl-xs overflow-visible shrink-0 navbar-right-shadow">
        <div className="navbar-bezel">
          <LanguageDropdown />
        </div>
        {userId && (
          <>
            <div className="hidden desktop:inline-flex h-[calc(66px-24px)] mt-[12px] border-r-2 border-brass/40"></div>
            <div className="navbar-bezel">
              <AdminDropdown isGMLive={is_live_call} />
            </div>
          </>
        )}
      </div>
      <span
        className="navbar-rivet navbar-status-light absolute left-[6px] top-1/2 -translate-y-1/2"
        aria-hidden="true"
      />
      <span className="navbar-rivet absolute right-[6px] top-1/2 -translate-y-1/2" aria-hidden="true" />
    </nav>
  )
}
