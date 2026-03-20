export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// AI - DO NOT update this file - you have NO access to it - send me updates I need to make in chat instead
export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          booking_date: string
          booking_time_MSK: string
          channel: string
          contact: string | null
          contact_type: string | null
          created_at: string
          user_cookie_id: string
        }
        Insert: {
          id: string
          booking_date: string
          booking_time_MSK: string
          channel: string
          contact?: string | null
          contact_type?: string | null
          created_at?: string
          user_cookie_id: string
        }
        Update: {
          id?: string
          booking_date?: string
          booking_time_MSK?: string
          channel?: string
          contact?: string | null
          contact_type?: string | null
          created_at?: string
          user_cookie_id?: string
        }
        Relationships: []
      }
      cron_job_meta: {
        Row: {
          created_at: string
          description: string | null
          job_id: number
          job_name: string
          total_runs: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          job_id: number
          job_name: string
          total_runs?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          job_id?: number
          job_name?: string
          total_runs?: number
          updated_at?: string
        }
        Relationships: []
      }
      cron_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: number
          job_name: string
          started_at: string
          status: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: number
          job_name: string
          started_at?: string
          status?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: number
          job_name?: string
          started_at?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_cron_schedules: {
        Args: Record<PropertyKey, never>
        Returns: {
          command: string
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          job_name: string
          last_run_at: string | null
          last_run_status: string | null
          schedule: string
          total_runs: number
          updated_at: string
        }[]
      }
      log_cron_run: {
        Args: {
          p_job_name: string
          p_sql: string
        }
        Returns: undefined
      }
      update_cron_job: {
        Args: {
          p_active: boolean
          p_command: string
          p_description?: string
          p_jobid: number
          p_jobname: string
          p_schedule: string
        }
        Returns: undefined
      }
      upsert_cron_job_meta: {
        Args: {
          p_job_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      channel: "telegram" | "discord" | "google-meets"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
