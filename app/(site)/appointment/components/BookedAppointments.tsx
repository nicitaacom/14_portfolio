"use client"

import moment from "moment"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { MdOutlineCancel } from "react-icons/md"
import { SiGooglemeet } from "react-icons/si"
import { useState } from "react"

import { BookingsResponse } from "@/interfaces/BookingsResponse"
import { convertCurrentToTargetTimezone } from "@/(site)/functions/convertCurrentToTargetTimezone"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { deleteDBAppointmentAction } from "@/(site)/actions/deleteDBAppointmentAction"
import { Button } from "@/components/Button"

export function BookedAppointments({ booked_appointments }: { booked_appointments: BookingsResponse[] }) {
  const { selectedTimezone } = useSelectedTimezoneStore()
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <div>
      <ul className="flex flex-col gap-y-sm">
        {booked_appointments.map(booked_appointment => (
          <li
            className="w-full flex flex-row justify-between items-center gap-x-sm border border-secondary-foreground rounded
            px-sm py-xs"
            key={booked_appointment.id}>
            <div className="flex flex-col">
              <p>
                Booked date: {moment(booked_appointment.booking_date).format("DD.MM.YYYY")} at&nbsp;
                {convertCurrentToTargetTimezone(booked_appointment.booking_time_MSK, "Europe/Moscow", selectedTimezone)}
                &nbsp;
                {selectedTimezone}
              </p>
              <p className="flex flex-row items-center">
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
            <div className="flex flex-row gap-x-xs">
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
