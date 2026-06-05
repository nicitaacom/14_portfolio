"use client"

import { useState } from "react"
import { deleteDBAppointmentAction } from "../actions/deleteDBAppointmentAction"
import { updateDBAppointmentAction } from "../actions/updateDBAppointmentAction"

interface UseBookingActionsOptions {
  onDeleteSuccess?: () => void
  onUpdateSuccess?: () => void
  onError?: (error: Error) => void
}

export function useBookingActions(options: UseBookingActionsOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)

  async function deleteBooking(id: string, formattedDate: string, timeMSK: string) {
    try {
      setIsLoading(true)
      await deleteDBAppointmentAction(id, formattedDate, timeMSK)
      options.onDeleteSuccess?.()
    } catch (error) {
      if (error instanceof Error) options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateBooking(
    id: string,
    nextDate: string,
    nextTimeMSK: string,
    prevFormattedDate: string,
    prevTimeMSK: string,
  ) {
    try {
      setIsLoading(true)
      await updateDBAppointmentAction(id, nextDate, nextTimeMSK, prevFormattedDate, prevTimeMSK)
      options.onUpdateSuccess?.()
    } catch (error) {
      if (error instanceof Error) options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, deleteBooking, updateBooking }
}
