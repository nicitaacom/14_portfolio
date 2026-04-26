import { redirect } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

import supabaseServer from "@/libs/supabaseServer"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { parseAdminUserIdArr } from "@/libs/adminAuth"
import { AdminDashboardClient } from "../[locale]/(site)/admin-dashboard/AdminDashboardClient"
import { TLocale } from "@/locales/config"
import { localizePath } from "@/locales/helpers"

export const dynamic = "force-dynamic"

export async function AdminDashboardPageView({ locale }: { locale: TLocale }) {
  noStore()

  const {
    data: { user },
  } = await supabaseServer().auth.getUser()

  const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)

  if (!user?.id || !adminUserIds.includes(user.id)) redirect(localizePath("/", locale))

  const [{ data: cronSchedules, error: cronError }, { data: bookings, error: bookingsError }] = await Promise.all([
    supabaseAdmin.rpc("get_cron_schedules"),
    supabaseAdmin
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time_MSK", { ascending: true }),
  ])

  if (cronError) {
    console.error("Failed to load cron schedules for admin dashboard:", cronError)
  }

  if (bookingsError) {
    console.error("Failed to load bookings for admin dashboard:", bookingsError)
  }

  return <AdminDashboardClient bookings={bookings ?? []} cronSchedules={cronSchedules ?? []} userId={user.id} />
}
