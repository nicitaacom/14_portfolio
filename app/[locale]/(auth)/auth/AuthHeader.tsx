"use client"

import { useScopedI18n } from "@/locales/client"

interface AuthHeaderProps {
  errorMessage: string
}

export function AuthHeader({ errorMessage }: AuthHeaderProps) {
  const t = useScopedI18n("auth")

  return (
    <div className="flex flex-col gap-xs">
      <h1 className="text-lg text-secondary">{t("title")}</h1>
      <p className="text-sm">{t("subtitle1")}</p>
      <p className="text-sm">{t("subtitle2")}</p>
      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
    </div>
  )
}
