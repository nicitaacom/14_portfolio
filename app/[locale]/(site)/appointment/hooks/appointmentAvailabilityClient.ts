"use client"

import { useModalsStore } from "@/store/useModalsStore"
import { useAppointmentStore } from "@/store/useAppointmentStore"
import {
  getEarliestAvailableSlot,
  getSlotStatus,
  getSlotsForDisplayDay,
  type AppointmentSlot,
} from "@/libs/appointmentSlots"

let activeController: AbortController | null = null

export interface AvailabilityPayload {
  ok: true
  date: string
  timezone: string
  serverNow: string
  minimumNoticeMinutes: number
  slots: AppointmentSlot[]
}

type AvailabilityState = Pick<ReturnType<typeof useAppointmentStore.getState>,
  "availabilityError" | "availabilityLoading" | "availabilityDate" | "availabilityTimezone" | "availabilityServerNow" | "availabilityReceivedAt" | "availabilitySlots"
>

export async function fetchAppointmentAvailability(date: string, timezone: string, signal?: AbortSignal, excludeBookingId?: string): Promise<AvailabilityPayload> {
  const query = new URLSearchParams({ date, timezone })
  if (excludeBookingId) query.set("excludeBookingId", excludeBookingId)
  const response = await fetch(`/api/bookings/availability?${query.toString()}`, { cache: "no-store", signal })
  const result = await response.json() as AvailabilityPayload | { ok: false; error?: string }
  if (!response.ok || !result.ok) throw new Error("Availability could not be refreshed.")
  return result
}

function statusCode(slot: AppointmentSlot | undefined): API.SlotFailureCode {
  if (slot?.status === "past") return "SLOT_IN_PAST"
  if (slot?.status === "too_soon") return "SLOT_TOO_SOON"
  if (slot?.status === "blocked") return "SLOT_BLOCKED"
  if (slot?.status === "booked") return "SLOT_BOOKED"
  return "SLOT_UNAVAILABLE"
}

export async function refreshAppointmentAvailability(date: string, timezone: string, replaceInvalid = true) {
  activeController?.abort()
  const controller = new AbortController()
  activeController = controller
  const store = useAppointmentStore.getState()
  const requestId = store.beginAvailabilityRequest(date, timezone)
  try {
    const fetchAppointmentAvailabilityResp = await fetchAppointmentAvailability(date, timezone, controller.signal)
    const current = useAppointmentStore.getState()
    if (current.availabilityRequestId !== requestId || controller.signal.aborted) return null
    if (!current.finishAvailabilityRequest(requestId, date, timezone, Date.parse(fetchAppointmentAvailabilityResp.serverNow), fetchAppointmentAvailabilityResp.slots)) return null

    const selectedSlot = fetchAppointmentAvailabilityResp.slots.find(slot => slot.startsAt === current.selectedSlotStart)
    const selectedIsValid = selectedSlot?.status === "available"
    const modalOpen = useModalsStore.getState().isOpen.Appointment
    if (current.selectedSlotStart && !selectedIsValid) {
      const code = statusCode(selectedSlot)
      current.setAvailabilityNoticeCode(code)
      if (modalOpen || !replaceInvalid) current.setSelectionInvalid(true)
      else {
        current.setSelectedSlotStart(getEarliestAvailableSlot(fetchAppointmentAvailabilityResp.slots)?.startsAt ?? null)
        current.setSelectionInvalid(false)
      }
      return { ...fetchAppointmentAvailabilityResp, selectionChanged: !modalOpen && replaceInvalid, invalidCode: code }
    }

    if (!current.selectedSlotStart || current.selectionInvalid) {
      if (!modalOpen && replaceInvalid) {
        current.setSelectedSlotStart(getEarliestAvailableSlot(fetchAppointmentAvailabilityResp.slots)?.startsAt ?? null)
        current.setSelectionInvalid(false)
      }
    }
    return { ...fetchAppointmentAvailabilityResp, selectionChanged: false, invalidCode: null }
  } catch (error) {
    if (!controller.signal.aborted) useAppointmentStore.getState().failAvailabilityRequest(requestId)
    if (controller.signal.aborted) return null
    throw error
  }
}

export function getCurrentAppointmentSlots(nowMs = Date.now(), state: AvailabilityState = useAppointmentStore.getState()): AppointmentSlot[] {
  if (state.availabilityError || state.availabilityLoading || !state.availabilityDate || !state.availabilityTimezone) return []
  const elapsed = state.availabilityReceivedAt === null || state.availabilityServerNow === null ? 0 : Math.max(0, nowMs - state.availabilityReceivedAt)
  const anchoredNow = (state.availabilityServerNow ?? nowMs) + elapsed
  const occupancy = state.availabilitySlots
    .filter(slot => slot.status === "booked" || slot.status === "blocked")
    .map(slot => ({ startsAt: slot.startsAt, kind: slot.status as "booked" | "blocked" }))
  return getSlotsForDisplayDay(state.availabilityDate, state.availabilityTimezone, anchoredNow, occupancy)
}

export function currentSlotFailureCode(startsAt: string | null): API.SlotFailureCode {
  if (!startsAt) return "SLOT_UNAVAILABLE"
  return statusCode(getCurrentAppointmentSlots().find(slot => slot.startsAt === startsAt))
}
