// DO NOT import anything here

declare module API {
  type AdminPasswordRequest = {
    password: string
  }

  type AdminPasswordResponse = {
    ok: boolean
    error?: string
  }

  type InsertBookingRequest = {
    bookingId: string
    selectedDate: string | null | [string | null, string | null]
    atMSK: string
    channel: "telegram" | "discord" | "google-meets"
    contactType: "telegram" | "discord" | "email" | "linkedin"
    contact: string
    isSendNotification: boolean
    sendNotificationTo: "tg" | "dis" | "email"
    inputNotificationTo: string
  }

  type InsertBookingResponse = {
    ok: boolean
    error?: string
  }

  type RateLimitRequest = {
    action: "rateLimit" | "getRemaining"
    limiterName: "bookACall"
    userTimezone: string
    userCookieId?: string
  }

  type RateLimitResponse = {
    remaining: number
    resetTime?: string
    error?: string
  }
}
