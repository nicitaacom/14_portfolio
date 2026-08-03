"use server"

import { sendTelegramMessage } from "@/utils/sendTelegramMessage"

export async function sendTelegramMessageAction(message: string) {
  await sendTelegramMessage(`Booked call: ${message} \n`)
}
