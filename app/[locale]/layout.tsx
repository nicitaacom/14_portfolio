import { notFound } from "next/navigation"

import { I18nProviderClient } from "@/locales/client"
import { isLocale } from "@/locales/helpers"

export const dynamic = "force-dynamic"

export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}) {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>
}
