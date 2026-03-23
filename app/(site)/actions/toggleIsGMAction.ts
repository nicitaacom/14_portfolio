"use server"

import { redis } from "@/libs/redis"

export async function toggleIsGMAction() {
  let isLiveCall = false
  const isLiveCallStringResp = await redis.get<string>("isGMLive")
  if (!isLiveCallStringResp) await redis.set("isGMLive", "false")
  else isLiveCall = JSON.parse(isLiveCallStringResp)

  // toggle state
  const reversedState = !isLiveCall
  await redis.set("isGMLive", JSON.stringify(reversedState))
}
