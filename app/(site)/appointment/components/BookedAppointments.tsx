"use client"

import moment from "moment"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { FiEdit3, FiSave } from "react-icons/fi"
import { MdOutlineCancel } from "react-icons/md"
import { SiGooglemeet } from "react-icons/si"
import { useState } from "react"

import { BookingsResponse } from "@/interfaces/BookingsResponse"
import { convertCurrentToTargetTimezone } from "@/(site)/functions/convertCurrentToTargetTimezone"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { deleteDBAppointmentAction } from "@/(site)/actions/deleteDBAppointmentAction"
import { Button } from "@/components/Button"
import { updateDBAppointmentAction } from "@/(site)/actions/updateDBAppointmentAction"
import { Input } from "@/components/Input"
import useToast from "@/store/useToast"

export function BookedAppointments({ booked_appointments }: { booked_appointments: BookingsResponse[] }) {
  const { selectedTimezone } = useSelectedTimezoneStore()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [draftBookingDate, setDraftBookingDate] = useState("")
  const [draftBookingTime, setDraftBookingTime] = useState("")

  async function deleteDBAppointmentFn(
    bookedAppointmentId: string,
    bookedAppointmentDate: string,
    bookedAppointmentTimeMSK: string,
  ) {
    try {
      setIsLoading(true)
      await deleteDBAppointmentAction(
        bookedAppointmentId,
        moment(bookedAppointmentDate).format("DD.MM.YYYY"),
        bookedAppointmentTimeMSK,
      )
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  function startEditing(booking: BookingsResponse) {
    setEditingAppointmentId(booking.id)
    setDraftBookingDate(moment(booking.booking_date).format("YYYY-MM-DD"))
    setDraftBookingTime(convertCurrentToTargetTimezone(booking.booking_time_MSK, "Europe/Moscow", selectedTimezone))
  }

  function stopEditing() {
    setEditingAppointmentId(null)
    setDraftBookingDate("")
    setDraftBookingTime("")
  }

  async function updateDBAppointmentFn(booking: BookingsResponse) {
    try {
      setIsLoading(true)
      const nextBookingTimeMSK = convertCurrentToTargetTimezone(draftBookingTime, selectedTimezone, "Europe/Moscow")

      await updateDBAppointmentAction(
        booking.id,
        draftBookingDate,
        nextBookingTimeMSK,
        moment(booking.booking_date).format("DD.MM.YYYY"),
        booking.booking_time_MSK,
      )

      stopEditing()
    } catch (error) {
      if (error instanceof Error) {
        toast.show("error", "Error updating booking", error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full laptop:sticky laptop:top-[6rem]">
      <div className="rounded-[16px] border border-[#777777] bg-primary-foreground/30 p-md shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
        <div className="mb-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Scheduled appointments</p>
          <p className="mt-[4px] text-sm text-secondary-foreground">
            Upcoming bookings stay easy to manage on both desktop and mobile.
          </p>
        </div>

        <ul className="flex flex-col gap-sm">
        {booked_appointments.map(booked_appointment => (
          <li
            className="flex min-w-0 flex-col gap-sm rounded-[10px] border border-secondary-foreground px-sm py-sm"
            key={booked_appointment.id}>
            <div className="flex flex-col gap-xs">
              {editingAppointmentId === booked_appointment.id ? (
                <div className="flex flex-col gap-y-xs">
                  <div className="flex flex-col tablet:flex-row gap-xs">
                    <Input type="date" value={draftBookingDate} onChange={e => setDraftBookingDate(e.target.value)} />
                    <Input type="time" value={draftBookingTime} onChange={e => setDraftBookingTime(e.target.value)} />
                  </div>
                  <p className="text-xs">Time is edited in {selectedTimezone} and saved in Moscow time.</p>
                </div>
              ) : (
                <p className="leading-relaxed">
                  Booked date: {moment(booked_appointment.booking_date).format("DD.MM.YYYY")} at&nbsp;
                  {convertCurrentToTargetTimezone(booked_appointment.booking_time_MSK, "Europe/Moscow", selectedTimezone)}
                  &nbsp;
                  {selectedTimezone}
                </p>
              )}
              <p className="flex flex-row items-center gap-[4px] leading-relaxed">
                Channel: {booked_appointment.channel}&nbsp;
                {booked_appointment.channel === "google-meets" ? (
                  <SiGooglemeet />
                ) : booked_appointment.channel === "discord" ? (
                  <FaDiscord />
                ) : (
                  <FaTelegramPlane />
                )}
              </p>
            </div>
            <div className="flex flex-row justify-end gap-x-xs">
              {editingAppointmentId === booked_appointment.id ? (
                <>
                  <Button
                    className="border-success"
                    isDisabled={isLoading || !draftBookingDate || !draftBookingTime}
                    onClick={() => updateDBAppointmentFn(booked_appointment)}>
                    <FiSave className="text-success" />
                  </Button>
                  <Button className="border-secondary-foreground" isDisabled={isLoading} onClick={stopEditing}>
                    <MdOutlineCancel />
                  </Button>
                </>
              ) : (
                <>
                  <Button className="border-cta" isDisabled={isLoading} onClick={() => startEditing(booked_appointment)}>
                    <FiEdit3 className="text-cta" />
                  </Button>
                  <Button
                    className="border-danger"
                    isDisabled={isLoading}
                    onClick={() =>
                      deleteDBAppointmentFn(
                        booked_appointment.id,
                        booked_appointment.booking_date,
                        booked_appointment.booking_time_MSK,
                      )
                    }>
                    <MdOutlineCancel className="text-danger" />
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
        </ul>
      </div>
    </div>
  )
}
