"use server"

import { redisKey } from "@/classes/RedisKey/RedisKey"
import { redis } from "@/libs/redis"

export async function toggleIsGMAction() {
  let isLiveCall = false
  const isGMLiveKey = redisKey.getIsGMLiveKey()
  const isLiveCallStringResp = await redis.get<string>(isGMLiveKey)
  if (!isLiveCallStringResp) await redis.set(isGMLiveKey, "false")
  else isLiveCall = JSON.parse(isLiveCallStringResp)

  // toggle state
  const reversedState = !isLiveCall
  await redis.set(isGMLiveKey, JSON.stringify(reversedState))
}
