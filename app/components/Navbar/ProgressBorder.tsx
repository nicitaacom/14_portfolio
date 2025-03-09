"use client"

import { useEffect, useState } from "react"

interface ProgressBorderProps {
  scrollRef: React.RefObject<HTMLDivElement>
}

export function ProgressBorder({ scrollRef }: ProgressBorderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      // console.log(14, "scrollRef.current - ", scrollRef.current)
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const maxScroll = scrollWidth - clientWidth
        const currentProgress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
        console.log(
          "scrollLeft:",
          scrollLeft,
          "scrollWidth:",
          scrollWidth,
          "clientWidth:",
          clientWidth,
          "progress:",
          currentProgress,
        )
        setProgress(currentProgress)
      }
    }

    // Initial update
    updateProgress()

    // Poll for changes
    const interval = setInterval(() => {
      // console.log(27, "updateProgress")
      updateProgress()
    }, 100)

    // Cleanup
    return () => clearInterval(interval)
  }, [scrollRef])

  return (
    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white z-0 overflow-hidden">
      <div className="h-full bg-cta" style={{ width: `${progress}%` }} />
    </div>
  )
}
