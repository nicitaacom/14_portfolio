"use client"

import Link from "next/link"
import { repos } from "@/data/repos"
import { useSlider } from "@/hooks"
import { useCallback, useEffect, useRef } from "react"
import { NavbarWaves, type NavbarWavesHandle } from "./NavbarWaves"

export function NavbarProjects({
  progress,
  setScrollRef,
}: {
  progress: number
  setScrollRef: (ref: React.RefObject<HTMLDivElement | null>) => void
}) {
  const { handleMouseDown, handleMouseMove, handleTouchDown, handleTouchMove, hasMovedRef, wrapperRef } = useSlider()
  const navbarWavesRef = useRef<NavbarWavesHandle>(null)

  function preventLinkAfterDrag(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasMovedRef.current) return

    event.preventDefault()
    hasMovedRef.current = false
  }

  const updateWaveField = useCallback(() => {
    const scrollContainer = wrapperRef.current
    if (!scrollContainer) return

    const scrollPosition = scrollContainer.scrollLeft
    navbarWavesRef.current?.setScrollPosition(scrollPosition)
  }, [wrapperRef])

  useEffect(() => {
    setScrollRef(wrapperRef)
    const frame = requestAnimationFrame(updateWaveField)

    return () => cancelAnimationFrame(frame)
  }, [wrapperRef, setScrollRef, updateWaveField])

  return (
    <div className="navbar-repo-wavefield relative isolate hidden desktop:flex flex-1 min-w-0 overflow-hidden pb-[6px]">
      <NavbarWaves ref={navbarWavesRef} />
      <div
        className="navbar-repo-scroll-mask relative z-[1] w-full overflow-x-hidden cursor-grab py-xs"
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onScroll={updateWaveField}>
        <ul className="navbar-repo-wave-items hidden desktop:inline-flex gap-md">
          {repos.map(repo => (
            <li key={repo.id} className="flex flex-col items-center gap-y-[2px] w-[10rem] select-none">
              <p className="machine-slot font-typewriter text-xs tracking-[0.12em] px-[8px] py-[1px] text-secondary-foreground">
                {repo.id}
              </p>
              <Link
                className="navbar-engraved text-sm transition-all duration-200 ease-in hover:text-secondary hover:[text-shadow:0_0_6px_hsl(var(--cta)/0.6)] whitespace-nowrap cursor-pointer select-none"
                draggable={false}
                href={repo.url}
                onClick={preventLinkAfterDrag}
                target="_blank">
                {repo.description}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="hazard-rail absolute bottom-0 left-0 z-[2] h-[6px] w-full" aria-hidden="true">
        <div className="hazard-rail-progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
