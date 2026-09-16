import { PublicSiteShell } from "@/components/PublicSiteShell"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>
}
