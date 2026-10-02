import type { SupabaseClient } from "@supabase/supabase-js"

import type { AppointmentDatabase } from "@/interfaces/AppointmentDatabase"
import supabaseAdmin from "@/libs/supabaseAdmin"
import type { OccupiedSlot } from "@/libs/appointmentSlots"

const appointmentDb = supabaseAdmin as unknown as SupabaseClient<AppointmentDatabase>

export async function readAppointmentOccupancy(fromInclusive: string, toExclusive: string) {
  const { data, error } = await appointmentDb
    .from("appointment_slot_occupancy")
    .select("starts_at, kind, booking_id")
    .gte("starts_at", fromInclusive)
    .lt("starts_at", toExclusive)
  if (error) return { data: null, error }
  const occupancy: OccupiedSlot[] = (data ?? []).map(row => ({ startsAt: row.starts_at, kind: row.kind, bookingId: row.booking_id }))
  return { data: occupancy, error: null }
}

export async function readAppointmentSlot(startsAt: string) {
  const { data, error } = await appointmentDb
    .from("appointment_slot_occupancy")
    .select("starts_at, kind, booking_id")
    .eq("starts_at", startsAt)
    .maybeSingle()
  if (error) return { data: null, error }
  return {
    data: data ? ({ startsAt: data.starts_at, kind: data.kind, bookingId: data.booking_id } satisfies OccupiedSlot) : null,
    error: null,
  }
}

export async function setAppointmentBlocks(startsAt: string[], blocked: boolean, actorId: string) {
  const { data, error } = await appointmentDb.rpc("set_appointment_blocks", {
    p_starts_at: startsAt,
    p_blocked: blocked,
    p_actor_id: actorId,
  })
  if (error) return { data: null, error }
  const first = data?.[0]
  return { data: { changed: first?.changed ?? 0, unchanged: first?.unchanged ?? 0 }, error: null }
}

export async function hasAppointmentReminder(bookingId: string) {
  const { data, error } = await appointmentDb
    .from("telegram_notifications")
    .select("id")
    .eq("booking_id", bookingId)
    .limit(1)
  if (error) return { data: null, error }
  return { data: Boolean(data?.length), error: null }
}
