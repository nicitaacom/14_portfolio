"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { revalidatePath } from "next/cache"
import { sendTelegramMessageAction } from "./sendTelegramMessageAction"

export async function deleteDBAppointmentAction(
  bookedAppointmentId: string,
  bookedDate: string,
  bookedTimeMSK: string,
) {
  const { error } = await supabaseAdmin.from("bookings").delete().eq("id", bookedAppointmentId)
  if (error) throw new Error(error.message)
  await sendTelegramMessageAction(`somebody canceled booking a call ${bookedDate} at ${bookedTimeMSK}`)
  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
}
