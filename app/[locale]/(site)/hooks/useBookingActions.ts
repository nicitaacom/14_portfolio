"use client"

import { useCallback, useRef, useState } from "react"
import { deleteDBAppointmentAction } from "../actions/deleteDBAppointmentAction"
import { updateDBAppointmentAction } from "../actions/updateDBAppointmentAction"
import type { BookingActionResult } from "../actions/updateDBAppointmentAction"

interface UseBookingActionsOptions {
  onDeleteSuccess?: (result: BookingActionResult) => void
  onUpdateSuccess?: (result: BookingActionResult) => void
  onDeleteFailure?: (result: BookingActionResult) => void
  onUpdateFailure?: (result: BookingActionResult) => void
  onError?: (error: Error) => void
}

export function useBookingActions(options: UseBookingActionsOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const deleteBooking = useCallback(async (id: string): Promise<BookingActionResult> => {
    try {
      setIsLoading(true)
      const deleteDBAppointmentActionResp = await deleteDBAppointmentAction(id)
      if (deleteDBAppointmentActionResp.ok) optionsRef.current.onDeleteSuccess?.(deleteDBAppointmentActionResp)
      else optionsRef.current.onDeleteFailure?.(deleteDBAppointmentActionResp)
      return deleteDBAppointmentActionResp
    } catch (error) {
      if (error instanceof Error) optionsRef.current.onError?.(error)
      return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: error instanceof Error ? error.message : "Request failed." }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateBooking = useCallback(async (
    id: string,
    nextStartsAt: string,
  ): Promise<BookingActionResult> => {
    try {
      setIsLoading(true)
      const updateDBAppointmentActionResp = await updateDBAppointmentAction(id, nextStartsAt)
      if (updateDBAppointmentActionResp.ok) optionsRef.current.onUpdateSuccess?.(updateDBAppointmentActionResp)
      else optionsRef.current.onUpdateFailure?.(updateDBAppointmentActionResp)
      return updateDBAppointmentActionResp
    } catch (error) {
      if (error instanceof Error) optionsRef.current.onError?.(error)
      return { ok: false, code: "AVAILABILITY_UNAVAILABLE", error: error instanceof Error ? error.message : "Request failed." }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, deleteBooking, updateBooking }
}
