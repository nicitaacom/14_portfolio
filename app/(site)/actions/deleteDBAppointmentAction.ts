"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { revalidatePath } from "next/cache"
import { sendTelegramMessageAction } from "./sendTelegramMessageAction"
import { deleteTgNtfctnAction } from "./deleteTgNtfctnAction"

export async function deleteDBAppointmentAction(
  bookedAppointmentId: string,
  bookedDate: string,
  bookedTimeMSK: string,
) {
  const deleteNotificationResp = await deleteTgNtfctnAction(bookedAppointmentId)
  if (typeof deleteNotificationResp === "string") throw new Error(deleteNotificationResp)

  const { error } = await supabaseAdmin.from("bookings").delete().eq("id", bookedAppointmentId)
  if (error) throw new Error(error.message)
  await sendTelegramMessageAction(`somebody canceled booking a call ${bookedDate} at ${bookedTimeMSK}`)
  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
}
