"use server"

export async function sendTelegramMessageAction(message: string) {
  const msgTg = `Booked call: ${message} \n`
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID
  const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`

  await fetch(URI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      parse_mode: "html",
      text: msgTg,
    }),
  })
}
