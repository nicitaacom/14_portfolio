declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_BOT_TOKEN: string
      TELEGRAM_CHAT_ID: string

      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string

      UPSTASH_REDIS_REST_URL: string
      UPSTASH_REDIS_REST_TOKEN: string
      UPSTASH_REDIS_URL: string

      NEXT_PUBLIC_AWS_REGION: string
      AWS_ACCOUNT_ID: string
      AWS_ACCESS_KEY_ID: string
      AWS_SECRET_ACCESS_KEY: string
      NEXT_PUBLIC_LAMBDA_FN_NAME: string
      
      WAKA_TIME_API_KEY: string
    }
  }
}

export {}
