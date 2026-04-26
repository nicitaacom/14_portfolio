"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function deleteTgNtfctnAction(bookingId: string): Promise<void | string> {
  if (!bookingId) return "Booking id is required"

  const { data, error: selectError } = await supabase
    .from("telegram_notifications")
    .select("id")
    .eq("booking_id", bookingId)

  if (selectError) {
    console.error("Error selecting telegram notifications:", selectError)
    return `Error selecting telegram notifications: ${selectError.message}`
  }

  if (data && data.length > 0) {
    const unscheduleQuery = `
      DO $$
      BEGIN
        ${data
          .map(
            ({ id }) => `
        BEGIN
          PERFORM cron.unschedule('telegram_notification_${id}');
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;`,
          )
          .join("\n")}
      END $$;
    `

    const { error: unscheduleError } = await supabase.rpc("execute_any_sql", { query: unscheduleQuery })
    if (unscheduleError) {
      console.error("Error unscheduling telegram notifications:", unscheduleError)
      return `Error unscheduling telegram notifications: ${unscheduleError.message}`
    }
  }

  const { error: deleteError } = await supabase.from("telegram_notifications").delete().eq("booking_id", bookingId)
  if (deleteError) {
    console.error("Error deleting telegram notifications:", deleteError)
    return `Error deleting telegram notifications: ${deleteError.message}`
  }
}
