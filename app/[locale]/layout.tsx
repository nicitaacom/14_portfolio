import { nanoid } from "nanoid"
import { notFound } from "next/navigation"

import Layout from "@/components/Layout"
import { Navbar } from "@/components/Navbar/Navbar"
import { UTMTracker } from "@/utm-stats/UTMTracker"
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

  return (
    <I18nProviderClient locale={locale}>
      <Navbar />
      <UTMTracker userId={`14-${nanoid()}`} />
      <Layout>{children}</Layout>
    </I18nProviderClient>
  )
}
