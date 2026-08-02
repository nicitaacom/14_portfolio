import { redisKey } from "@/classes/RedisKey/RedisKey"
import { redis } from "@/libs/redis"

// The GM live flag lives in redis and both the navbar and the appointment page are server
// components that can read it at the source. It used to reach the appointment page through a
// zustand state the navbar set in a mount effect instead - a second copy of one boolean plus a
// first paint where the join button was always hidden.
export async function getIsGMLive() {
  try {
    const isGMLiveKey = redisKey.getIsGMLiveKey()
    const isLiveCallStringResp = await redis.get<string>(isGMLiveKey)
    if (!isLiveCallStringResp) {
      await redis.set(isGMLiveKey, "false")
      return false
    }
    return JSON.parse(isLiveCallStringResp) as boolean
  } catch (error) {
    console.error("Error fetching GM Live status:", error)
    return false
  }
}
