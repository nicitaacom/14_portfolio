import type { TApplicationsTone } from "../types/TApplicationsTone"

/** Maps avg monthly appointments to a status tone. <=2 danger · 3–4 warning · >=5 success. */
export function getAppointmentsStatusTone(appointments: number): TApplicationsTone {
  if (appointments <= 2) return "danger"
  if (appointments <= 4) return "warning"
  return "success"
}
