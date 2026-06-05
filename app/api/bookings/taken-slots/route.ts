import moment from "moment"
import { NextResponse } from "next/server"
import supabaseAdmin from "@/libs/supabaseAdmin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")

  if (!date || !moment(date, "YYYY-MM-DD", true).isValid()) {
    return NextResponse.json({ slots: [] }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from("bookings")
    .select("booking_time_MSK")
    .eq("booking_date", date)

  return NextResponse.json({ slots: (data ?? []).map(b => b.booking_time_MSK.slice(0, 5)) })
}
