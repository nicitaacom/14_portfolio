import { redis } from "@/libs/redis"

const secToHours = (seconds: number) => Math.floor(seconds / 3600)

export async function getWakaHours() {
  const [react, typescript, tailwind] = await redis.mget(
    "wakatime:react:seconds",
    "wakatime:typescript:seconds",
    "wakatime:tailwind:seconds",
  )

  return {
    react: secToHours(Number(react) || 0),
    typescript: secToHours(Number(typescript) || 0),
    tailwind: secToHours(Number(tailwind) || 0),
  }
}
