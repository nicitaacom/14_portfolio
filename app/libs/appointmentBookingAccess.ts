import { cookies } from "next/headers"

import { parseAdminUserIdArr } from "@/libs/adminAuth"
import supabaseServer from "@/libs/supabaseServer"

export interface AppointmentAccess {
  userCookieId: string | null
  adminId: string | null
}

export async function getAppointmentAccess(): Promise<AppointmentAccess> {
  const [cookieStore, supabase] = await Promise.all([cookies(), supabaseServer()])
  const { data, error } = await supabase.auth.getUser()
  const id = !error && data.user?.id ? data.user.id : null
  const adminId = id && parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR).includes(id) ? id : null
  return { userCookieId: cookieStore.get("user_cookie_id")?.value ?? null, adminId }
}
