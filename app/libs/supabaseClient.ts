import { Database } from "@/interfaces/types_db"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabaseClient = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

export default supabaseClient
