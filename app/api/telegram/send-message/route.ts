import { NextResponse } from "next/server"

import { sendTelegramMessage } from "@/utils/sendTelegramMessage"

const MAX_MESSAGE_LENGTH = 2000

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as API.SendTelegramMessageRequest | null
  const message = body?.message?.trim()

  if (!message) {
    return NextResponse.json<API.SendTelegramMessageResponse>(
      { ok: false, error: "Message is required" },
      { status: 400 },
    )
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json<API.SendTelegramMessageResponse>(
      { ok: false, error: `Message is longer than ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400 },
    )
  }

  const telegramResponse = await sendTelegramMessage(message)

  if (!telegramResponse.ok) {
    console.error("Error sending telegram message:", telegramResponse.description)
    return NextResponse.json<API.SendTelegramMessageResponse>(
      { ok: false, error: telegramResponse.description ?? "Error sending telegram message" },
      { status: 500 },
    )
  }

  return NextResponse.json<API.SendTelegramMessageResponse>({ ok: true })
}
