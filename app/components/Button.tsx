"use client"

import Link from "next/link"
import { twMerge } from "tailwind-merge"

import { useCurrentLocale } from "@/locales/client"
import { localizeHref } from "@/locales/helpers"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void
  children?: React.ReactNode
  href?: string
  target?: "_slef" | "_blank" | "_parent" | "_top"
  isDisabled?: boolean
  className?: string
}

export function Button({ onClick, children, href, target, isDisabled, className = "", ...props }: ButtonProps) {
  const locale = useCurrentLocale()
  const buttonCSS = twMerge(
    "plaque px-sm py-xs flex justify-center items-center gap-x-xs text-secondary",
    isDisabled && "opacity-50 cursor-default pointer-events-none",
    className,
  )

  if (href) {
    return (
      <Link className={buttonCSS} href={localizeHref(href, locale)} target={target}>
        {children}
      </Link>
    )
  } else
    return (
      <button className={buttonCSS} onClick={onClick} {...props}>
        {children}
      </button>
    )
}
