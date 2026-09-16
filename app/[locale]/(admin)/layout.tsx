import "./admin-dashboard.css"
import { inter } from "@/fonts"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`3d-dot ${inter.variable} min-h-dvh bg-[var(--3d-dot-c-111315)] !font-primary text-[var(--3d-dot-c-eef0f2)]`}>{children}</div>
}
