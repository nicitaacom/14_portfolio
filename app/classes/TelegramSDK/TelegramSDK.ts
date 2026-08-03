const SEND_MESSAGE_API_URL = "/api/telegram/send-message"

export class TelegramSDK {
  async sendMessage(message: string): Promise<string | void> {
    const response = await fetch(SEND_MESSAGE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message } satisfies API.SendTelegramMessageRequest),
    })

    const responseData = (await response.json().catch(() => null)) as API.SendTelegramMessageResponse | null
    if (!response.ok || !responseData?.ok) return responseData?.error ?? "Error sending telegram message"
  }
}
