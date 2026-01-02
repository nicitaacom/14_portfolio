import { redis } from "@/libs/redis"
import moment from "moment-timezone"

const SKILL_MAP = {
  TypeScript: "typescript",
  TSX: "typescript",
  JavaScript: "typescript",
  JSX: "react",
  CSS: "tailwind",
  HTML: "react",
} as const

// ✅ use moment instead of raw Date
const todayISO = () => moment().tz("Europe/Berlin").format("YYYY-MM-DD") // adjust tz if needed
const addDays = (date: string, days: number) => moment(date).tz("Europe/Berlin").add(days, "days").format("YYYY-MM-DD")

export async function syncWakaTime() {
  try {
    const lastSynced = (await redis.get("wakatime:last_synced_date")) as string | null
    let cursor = lastSynced ?? addDays(todayISO(), -1)

    console.log(22, "cursor >= todayISO() - ", cursor >= todayISO())
    if (cursor >= todayISO()) return { skipped: true }

    const totals: Record<string, number> = {}

    while (cursor < todayISO()) {
      const end = moment(cursor).add(13, "days").isBefore(moment(todayISO()))
        ? moment(cursor).add(13, "days").format("YYYY-MM-DD")
        : todayISO()

      const resp = await fetch(`https://wakatime.com/api/v1/users/current/summaries?start=${cursor}&end=${end}`, {
        headers: { Authorization: `Bearer ${process.env.WAKA_TIME_API_KEY}` },
      })
      console.log(35, "resp - ", resp)
      if (!resp.ok) throw new Error("WakaTime fetch failed")

      const json = await resp.json()
      console.log(35, "resp - ", json)

      for (const day of json.data || [])
        for (const lang of day.languages || []) {
          const skill = SKILL_MAP[lang.name as keyof typeof SKILL_MAP]
          if (!skill) continue
          totals[skill] = (totals[skill] || 0) + (lang.total_seconds || 0)
        }

      cursor = addDays(end, 1)
    }

    await Promise.all(
      Object.entries(totals).map(([skill, seconds]) => redis.incrby(`wakatime:${skill}:seconds`, seconds)),
    )

    await redis.set("wakatime:last_synced_date", todayISO())

    return { ok: true, totals }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
