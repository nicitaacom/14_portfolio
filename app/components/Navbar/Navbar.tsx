import supabaseServer from "@/libs/supabaseServer"
import { NavbarWithProgress } from "./NavbarWithProgress"
import { redis } from "@/libs/redis"

export async function Navbar() {
  let isLiveCall = false
  const isLiveCallStringResp = await redis.get("isGMLive")
  if (!isLiveCallStringResp) await redis.set("isGMLive", "false")
  else isLiveCall = JSON.parse(isLiveCallStringResp)

  const {
    data: { user },
  } = await supabaseServer().auth.getUser()

  return <NavbarWithProgress userId={user?.id} is_live_call={isLiveCall} />
}
