export interface BookingsResponse {
  id: string
  created_at: string
  user_cookie_id: string
  booking_date: string
  booking_time_MSK: string
  channel: string
  contact?: string | null
  contact_type?: string | null
}
