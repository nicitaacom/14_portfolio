"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { HalloweenRequestHand } from "@/components/Halloween/HalloweenRequestHand"
import { useCurrentLocale } from "@/locales/client"
import { localizeHref } from "@/locales/helpers"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void
  children?: React.ReactNode
  href?: string
  target?: "_slef" | "_blank" | "_parent" | "_top"
  isDisabled?: boolean
  className?: string
  requestAction?: boolean | "compact"
  requestPending?: boolean
}

export function Button({
  onClick,
  children,
  href,
  target,
  isDisabled,
  className = "",
  requestAction = false,
  requestPending = false,
  ...props
}: ButtonProps) {
  const locale = useCurrentLocale()
  const [requestPulse, setRequestPulse] = useState(false)
  const requestPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRequestControl = Boolean(requestAction) && !href
  const isCompactRequestControl = requestAction === "compact"
  const buttonCSS = twMerge(
    "site-control plaque px-sm py-xs flex justify-center items-center gap-x-xs text-secondary",
    isDisabled && "opacity-50 cursor-default pointer-events-none",
    isRequestControl &&
      `halloween-request-control ${
        isCompactRequestControl ? "halloween-request-control-compact" : "halloween-request-control-standard"
      }`,
    className,
  )

  useEffect(
    () => () => {
      if (requestPulseTimerRef.current) clearTimeout(requestPulseTimerRef.current)
    },
    [],
  )

  function activateRequestHand() {
    if (!isRequestControl) return

    if (requestPulseTimerRef.current) clearTimeout(requestPulseTimerRef.current)
    setRequestPulse(true)
    requestPulseTimerRef.current = setTimeout(() => setRequestPulse(false), 720)
  }

  if (href) {
    return (
      <Link className={buttonCSS} href={localizeHref(href, locale)} target={target}>
        {children}
      </Link>
    )
  } else
    return (
      <button
        className={buttonCSS}
        onClick={() => {
          activateRequestHand()
          onClick?.()
        }}
        {...props}>
        {isRequestControl ? <span className="halloween-request-content">{children}</span> : children}
        {isRequestControl && (
          <HalloweenRequestHand compact={isCompactRequestControl} engaged={requestPending || requestPulse} />
        )}
      </button>
    )
}
