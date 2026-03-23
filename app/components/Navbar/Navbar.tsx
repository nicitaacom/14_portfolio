import supabaseServer from "@/libs/supabaseServer"
import { NavbarWithProgress } from "./NavbarWithProgress"
import { redis } from "@/libs/redis"
import { parseAdminUserIdArr } from "@/libs/adminAuth"

export async function Navbar() {
  let isLiveCall = false
  const isLiveCallStringResp = await redis.get<string>("isGMLive")
  if (!isLiveCallStringResp) await redis.set("isGMLive", "false")
  else isLiveCall = JSON.parse(isLiveCallStringResp)

  const {
    data: { user },
  } = await supabaseServer().auth.getUser()

  const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)
  const adminUserId = user?.id && adminUserIds.includes(user.id) ? user.id : undefined

  return <NavbarWithProgress userId={adminUserId} is_live_call={isLiveCall} />
}
