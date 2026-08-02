import { parseAdminUserIdArr } from "@/libs/adminAuth"
import { getIsGMLive } from "@/libs/getIsGMLive"
import supabaseServer from "@/libs/supabaseServer"
import { NavbarWithProgress } from "./NavbarWithProgress"

export async function Navbar() {
  let adminUserId: string | undefined = undefined

  const getIsGMLiveResp = await getIsGMLive()

  try {
    const supabase = await supabaseServer()
    if (supabase?.auth) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)
      adminUserId = user?.id && adminUserIds.includes(user.id) ? user.id : undefined
    }
  } catch (error) {
    console.error("Error fetching user:", error)
  }

  return <NavbarWithProgress userId={adminUserId} is_live_call={getIsGMLiveResp} />
}
