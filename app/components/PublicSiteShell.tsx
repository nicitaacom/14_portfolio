import Layout from "@/components/Layout"
import { Navbar } from "@/components/Navbar/Navbar"
import { WorkbenchWall } from "@/components/WorkbenchWall"
import { HalloweenGraveEvent } from "@/components/Halloween/HalloweenGraveEvent"
import { NewYearFireworksEvent } from "@/components/NewYear/NewYearFireworksEvent"
import { NewYearJazzPlayer } from "@/components/NewYear/NewYearJazzPlayer"
import { UTMTracker } from "@/utm-stats/UTMTracker"
import { fraunces, inter, specialElite } from "@/fonts"

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${specialElite.variable} ${fraunces.variable} site-root relative isolate`}>
      <WorkbenchWall />
      <NewYearFireworksEvent />
      <div className="relative z-10">
        <HalloweenGraveEvent />
        <Navbar />
        <UTMTracker />
        <NewYearJazzPlayer />
        <Layout>{children}</Layout>
      </div>
    </div>
  )
}
