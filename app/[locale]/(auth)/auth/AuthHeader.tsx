"use client"

import { useScopedI18n } from "@/locales/client"

interface AuthHeaderProps {
  errorMessage: string
}

export function AuthHeader({ errorMessage }: AuthHeaderProps) {
  const t = useScopedI18n("auth")

  return (
    <div className="auth-header relative flex flex-col gap-xs">
      <div className="auth-seal hidden" aria-hidden="true" />
      <h1 className="auth-title text-lg text-secondary">{t("title")}</h1>
      <p className="text-sm">{t("subtitle1")}</p>
      <p className="text-sm">{t("subtitle2")}</p>
      {errorMessage && <p className="auth-error text-sm text-danger">{errorMessage}</p>}
    </div>
  )
}
