declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string

      UPSTASH_REDIS_REST_URL: string
      UPSTASH_REDIS_REST_TOKEN: string

      TELEGRAM_BOT_TOKEN: string
      TELEGRAM_CHAT_ID: string

      RESEND_SECRET: string
      NEXT_PUBLIC_SUPPORT_NOTIFICATION_EMAIL: string
      CRON_SECRET: string

      DEVICE_ID_ENCRYPTION_KEY: string

      ADMIN_USER_ID_ARR: string
      ADMIN_PASSWORD: string
    }
  }
}

export {}
