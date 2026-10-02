/** Local extension for the new availability schema. Keep generated types_db.ts untouched. */
export interface AppointmentDatabase {
  public: {
    Tables: {
      appointment_slot_occupancy: {
        Row: {
          starts_at: string
          kind: "booked" | "blocked"
          booking_id: string | null
          blocked_by: string | null
          created_at: string
        }
        Insert: {
          starts_at: string
          kind: "booked" | "blocked"
          booking_id?: string | null
          blocked_by?: string | null
          created_at?: string
        }
        Update: {
          starts_at?: string
          kind?: "booked" | "blocked"
          booking_id?: string | null
          blocked_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      telegram_notifications: {
        Row: { id: string; booking_id: string }
        Insert: { id?: string; booking_id: string }
        Update: { id?: string; booking_id?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      set_appointment_blocks: {
        Args: { p_starts_at: string[]; p_blocked: boolean; p_actor_id: string }
        Returns: { changed: number; unchanged: number }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
