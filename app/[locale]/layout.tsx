import { nanoid } from "nanoid"
import { notFound } from "next/navigation"

import Layout from "@/components/Layout"
import { Navbar } from "@/components/Navbar/Navbar"
import { WorkbenchWall } from "@/components/WorkbenchWall"
import { HalloweenGraveEvent } from "@/components/Halloween/HalloweenGraveEvent"
import { UTMTracker } from "@/utm-stats/UTMTracker"
import { I18nProviderClient } from "@/locales/client"
import { isLocale } from "@/locales/helpers"
import { inter, specialElite } from "@/fonts"

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
      <div className={`${inter.variable} ${specialElite.variable} relative isolate`}>
        <WorkbenchWall />
        <div className="relative z-10">
          <HalloweenGraveEvent />
          <Navbar />
          <UTMTracker userId={`14-${nanoid()}`} />
          <Layout>{children}</Layout>
        </div>
      </div>
    </I18nProviderClient>
  )
}
