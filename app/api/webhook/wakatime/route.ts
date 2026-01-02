import { redis } from "@/libs/redis"
import moment from "moment"
import { NextResponse } from "next/server"

const SKILL_MAP = {
  TypeScript: "typescript",
  TSX: "typescript",
  JavaScript: "typescript",
  JSX: "react",
  CSS: "tailwind",
  HTML: "react",
} as const

const todayISO = () => moment().tz("Europe/Berlin").format("YYYY-MM-DD")
const addDays = (date: string, days: number) => moment(date).tz("Europe/Berlin").add(days, "days").format("YYYY-MM-DD")

export async function GET() {
  try {
    const lastSynced = (await redis.get("wakatime:last_synced_date")) as string | null
    let cursor = lastSynced ?? addDays(todayISO(), -1)

    if (cursor >= todayISO()) return NextResponse.json({ ok: true, skipped: true })

    const totals: Record<string, number> = {}

    while (cursor < todayISO()) {
      const end = addDays(cursor, 13) <= todayISO() ? addDays(cursor, 13) : todayISO()

      const resp = await fetch(`https://wakatime.com/api/v1/users/current/summaries?start=${cursor}&end=${end}`, {
        headers: { Authorization: `Bearer ${process.env.WAKA_TIME_API_KEY}` },
      })

      if (!resp.ok) return NextResponse.json("wakatime fetch failed")

      const json = await resp.json()

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

    return NextResponse.json({ ok: true, totals })
  } catch (error) {
    return NextResponse.json(error instanceof Error ? error.message : String(error))
  }
}
