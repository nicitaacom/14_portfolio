import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

import { rateLimit } from "@/libs/rateLimit"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { Channel } from "@/store/useAppointmentStore"
import { Value } from "@/store/useSelectedDateStore"
import moment from "moment"

export type TAPIInsertBooking = {
  selectedDate: Value
  atMSK: string
  channel: Exclude<Channel, null>
  contactType: string
  contact: string
}

export async function POST(req: Request) {
  const { selectedDate, atMSK, channel, contactType, contact } = (await req.json()) as TAPIInsertBooking

  const userCookieId = cookies().get("user_cookie_id")?.value || nanoid()

  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  // Rate limit bookings
  const { success } = await rateLimit(ip, 1, 86400) // 1 booking per day

  if (!success) {
    return new NextResponse(`You have already booked a call today. Please try again tomorrow.`, {
      status: 429,
    })
  }

  const date = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
  if (!date) return new NextResponse(`No selectedDate`, { status: 400 })
  if (!contactType || !contact || contact.trim().length < 3) {
    return new NextResponse(`Contact details are required.`, { status: 400 })
  }
  const bookingDate = moment(date).format("YYYY-MM-DD")

  // Check is booking with this time already exists
  const { data } = await supabaseAdmin
    .from("bookings")
    .select()
    .eq("booking_time_MSK", atMSK)
    .eq("booking_date", bookingDate)

  if (data && data.length > 0) {
    console.error(40, "Error inserting booking: booking with this date time already exists")
    return new NextResponse(`Error inserting booking: booking with this date time already exists.`, {
      status: 409,
    })
  }
  const { error } = await supabaseAdmin.from("bookings").insert({
    id: nanoid(),
    booking_date: bookingDate,
    booking_time_MSK: atMSK,
    channel: channel,
    user_cookie_id: userCookieId,
    contact: `${contactType}: ${contact.trim()}`,
    contact_type: contactType,
  })

  if (error) {
    console.error(40, "Error inserting booking:", error)
    return new NextResponse(`Error inserting booking: ${error.message}`, {
      status: 400,
    })
  }
  return NextResponse.json({})
}
