"use client"

import Link from "next/link"
import { NavbarProjects } from "./NavbarProjects"
import { GMCheckbox } from "@/(site)/appointment/components/GMCheckbox"
import { useEffect, useState } from "react"
import { useIsGMLive } from "@/store/useIsGMLive"

interface NavbarWithProgressProps {
  userId: string | undefined
  is_live_call: boolean
}

export function NavbarWithProgress({ userId, is_live_call }: NavbarWithProgressProps) {
  const [scrollRef, setScrollRef] = useState<React.RefObject<HTMLDivElement> | null>(null)
  const [progress, setProgress] = useState(0)

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
      }}>
      <div className="flex items-center pr-md line">
        <Link data-text="Portfolio" href="/" className="text-shadow text-lg text-secondary before:text-secondary">
          Portfolio
        </Link>
      </div>
      <NavbarProjects setScrollRef={setScrollRef} />
      {userId && (
        <>
          <div className="hidden desktop:inline-flex h-[calc(66px-24px)] mt-[12px] border-r-2 border-[#909090]"></div>
          <GMCheckbox isGMLive={is_live_call} />
        </>
      )}
    </nav>
  )
}
