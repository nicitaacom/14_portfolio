import { nanoid } from "nanoid"
import { notFound } from "next/navigation"

import Layout from "@/components/Layout"
import { Navbar } from "@/components/Navbar/Navbar"
import { WorkbenchWall } from "@/components/WorkbenchWall"
import { HalloweenGraveEvent } from "@/components/Halloween/HalloweenGraveEvent"
import { NewYearFireworksEvent } from "@/components/NewYear/NewYearFireworksEvent"
import { NewYearJazzPlayer } from "@/components/NewYear/NewYearJazzPlayer"
import { UTMTracker } from "@/utm-stats/UTMTracker"
import { I18nProviderClient } from "@/locales/client"
import { isLocale } from "@/locales/helpers"
import { fraunces, inter, specialElite } from "@/fonts"

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
      <div className={`${inter.variable} ${specialElite.variable} ${fraunces.variable} relative isolate`}>
        <WorkbenchWall />
        {/* Fixed and lifted over the content layer in theme-new-year.css, so the shells read as
            sky seen through the room at any scroll position rather than being covered by
            whichever page is open */}
        <NewYearFireworksEvent />
        <div className="relative z-10">
          <HalloweenGraveEvent />
          <Navbar />
          <UTMTracker userId={`14-${nanoid()}`} />
          <NewYearJazzPlayer />
          <Layout>{children}</Layout>
        </div>
      </div>
    </I18nProviderClient>
  )
}
