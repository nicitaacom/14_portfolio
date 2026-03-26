import { redisKey } from "@/classes/RedisKey/RedisKey"
import { parseAdminUserIdArr } from "@/libs/adminAuth"
import { redis } from "@/libs/redis"
import supabaseServer from "@/libs/supabaseServer"
import { NavbarWithProgress } from "./NavbarWithProgress"

export async function Navbar() {
  let isLiveCall = false
  const isGMLiveKey = redisKey.getIsGMLiveKey()
  const isLiveCallStringResp = await redis.get<string>(isGMLiveKey)
  if (!isLiveCallStringResp) await redis.set(isGMLiveKey, "false")
  else isLiveCall = JSON.parse(isLiveCallStringResp)

  const {
    data: { user },
  } = await supabaseServer().auth.getUser()

  const adminUserIds = parseAdminUserIdArr(process.env.ADMIN_USER_ID_ARR)
  const adminUserId = user?.id && adminUserIds.includes(user.id) ? user.id : undefined

  return <NavbarWithProgress userId={adminUserId} is_live_call={isLiveCall} />
}
