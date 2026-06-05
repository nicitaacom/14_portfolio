import { redisKey } from "@/classes/RedisKey/RedisKey"
import { parseAdminUserIdArr } from "@/libs/adminAuth"
import { redis } from "@/libs/redis"
import supabaseServer from "@/libs/supabaseServer"
import { NavbarWithProgress } from "./NavbarWithProgress"

export async function Navbar() {
  let isLiveCall = false
  let adminUserId: string | undefined = undefined

  try {
    const isGMLiveKey = redisKey.getIsGMLiveKey()
    const isLiveCallStringResp = await redis.get<string>(isGMLiveKey)
    if (!isLiveCallStringResp) await redis.set(isGMLiveKey, "false")
    else isLiveCall = JSON.parse(isLiveCallStringResp)
  } catch (error) {
    console.error("Error fetching GM Live status:", error)
  }

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

  return <NavbarWithProgress userId={adminUserId} is_live_call={isLiveCall} />
}
