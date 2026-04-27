import { TLocale } from "@/locales/config"
import { AdminDashboardPageView } from "@/views/AdminDashboardPageView"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: TLocale }
}) {
  return <AdminDashboardPageView locale={locale} />
}
