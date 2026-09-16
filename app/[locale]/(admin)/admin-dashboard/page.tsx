import { TLocale } from "@/locales/config"
import { AdminDashboardPageView } from "@/views/AdminDashboardPageView"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: TLocale }> }) {
  const { locale } = await params

  return <AdminDashboardPageView locale={locale} />
}
