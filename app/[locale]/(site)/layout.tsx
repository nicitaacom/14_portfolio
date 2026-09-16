import { PublicSiteShell } from "@/components/PublicSiteShell"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>
}
