"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { revalidatePath } from "next/cache"
import { sendTelegramMessage } from "@/utils/sendTelegramMessage"
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
  const telegramResponse = await sendTelegramMessage(
    `somebody canceled booking a call ${bookedDate} at ${bookedTimeMSK}`,
  )
  if (!telegramResponse.ok) console.error("Error sending telegram message:", telegramResponse.description)
  revalidatePath("/appointment")
  revalidatePath("/admin-dashboard")
}
