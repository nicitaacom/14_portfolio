"use client"

import moment from "moment"
import { FaDiscord, FaTelegramPlane } from "react-icons/fa"
import { FiEdit3, FiSave } from "react-icons/fi"
import { MdOutlineCancel } from "react-icons/md"
import { SiGooglemeet } from "react-icons/si"
import { useState } from "react"

import { BookingsResponse } from "@/interfaces/BookingsResponse"
import { convertCurrentToTargetTimezone } from "../../functions/convertCurrentToTargetTimezone"
import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import useToast from "@/store/useToast"
import { useScopedI18n } from "@/locales/client"
import { useBookingActions } from "../../hooks/useBookingActions"

export function BookedAppointments({ booked_appointments }: { booked_appointments: BookingsResponse[] }) {
  const { selectedTimezone } = useSelectedTimezoneStore()
  const toast = useToast()
  const t = useScopedI18n("appointment.page")
  const commonT = useScopedI18n("common")
  const toastT = useScopedI18n("toast")
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [draftBookingDate, setDraftBookingDate] = useState("")
  const [draftBookingTime, setDraftBookingTime] = useState("")

  const { isLoading, deleteBooking, updateBooking } = useBookingActions({
    onError: error => toast.show("error", toastT("defaultErrorTitle"), error.message),
    onUpdateSuccess: stopEditing,
  })

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

  function deleteDBAppointmentFn(id: string, date: string, timeMSK: string) {
    deleteBooking(id, moment(date).format("DD.MM.YYYY"), timeMSK)
  }

  function updateDBAppointmentFn(booking: BookingsResponse) {
    const nextBookingTimeMSK = convertCurrentToTargetTimezone(draftBookingTime, selectedTimezone, "Europe/Moscow")
    updateBooking(
      booking.id,
      draftBookingDate,
      nextBookingTimeMSK,
      moment(booking.booking_date).format("DD.MM.YYYY"),
      booking.booking_time_MSK,
    )
  }

  return (
    <div className="appointment-bookings-board workbench-board mx-auto w-full max-w-[680px] p-[6px] laptop:sticky laptop:top-[6rem] laptop:max-w-none">
      <div className="machine-panel p-sm">
        <div className="appointment-bookings-heading mb-xs">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary">
            {t("scheduledAppointments")}
          </p>
          <p className="mt-[4px] max-w-[22rem] text-sm leading-relaxed text-secondary-foreground/75">
            {t("scheduledAppointmentsSubtitle")}
          </p>
        </div>

        <ul className="flex flex-col gap-xs">
          {!booked_appointments.length && (
            <li className="appointment-empty-card machine-bezel relative px-sm py-sm text-sm leading-relaxed text-secondary-foreground">
              {t("noAppointments")}
            </li>
          )}
          {booked_appointments.map(booked_appointment => (
            <li
              className="appointment-booking-card machine-bezel flex min-w-0 flex-col gap-xs px-sm py-sm"
              key={booked_appointment.id}>
              <div className="flex flex-col gap-xs">
                {editingAppointmentId === booked_appointment.id ? (
                  <div className="flex flex-col gap-y-xs">
                    <div className="flex flex-col gap-xs tablet:flex-row laptop:flex-col">
                      <Input
                        className="min-w-0 w-full text-secondary"
                        type="date"
                        value={draftBookingDate}
                        onChange={e => setDraftBookingDate(e.target.value)}
                      />
                      <Input
                        className="min-w-0 w-full text-secondary"
                        type="time"
                        value={draftBookingTime}
                        onChange={e => setDraftBookingTime(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-secondary-foreground">
                      {t("timeEditedIn", { timezone: selectedTimezone })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-secondary">
                    {t("bookedDateAt", {
                      date: moment(booked_appointment.booking_date).format("DD.MM.YYYY"),
                      time: convertCurrentToTargetTimezone(
                        booked_appointment.booking_time_MSK,
                        "Europe/Moscow",
                        selectedTimezone,
                      ),
                      timezone: selectedTimezone,
                    })}
                  </p>
                )}
                <p className="flex flex-row items-center gap-[6px] text-sm leading-relaxed text-secondary-foreground">
                  {commonT("channel")}: {booked_appointment.channel}
                  {booked_appointment.channel === "google-meets" ? (
                    <SiGooglemeet className="text-[#00ac47]" />
                  ) : booked_appointment.channel === "discord" ? (
                    <FaDiscord className="text-[#5865f2]" />
                  ) : (
                    <FaTelegramPlane className="text-[#229ed9]" />
                  )}
                </p>
              </div>
              <div className="flex flex-row justify-end gap-x-xs">
                {editingAppointmentId === booked_appointment.id ? (
                  <>
                    <Button
                      title={t("saveChanges")}
                      className="h-[34px] w-[34px] border-success !p-[0px]"
                      isDisabled={isLoading || !draftBookingDate || !draftBookingTime}
                      requestAction="compact"
                      requestPending={isLoading}
                      onClick={() => updateDBAppointmentFn(booked_appointment)}>
                      <FiSave className="text-success" size={16} />
                    </Button>
                    <Button
                      title={t("cancelEdit")}
                      className="h-[34px] w-[34px] border-secondary-foreground !p-[0px]"
                      isDisabled={isLoading}
                      onClick={stopEditing}>
                      <MdOutlineCancel size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      title={t("editAppointment")}
                      className="h-[34px] w-[34px] border-cta !p-[0px]"
                      isDisabled={isLoading}
                      onClick={() => startEditing(booked_appointment)}>
                      <FiEdit3 className="text-cta" size={16} />
                    </Button>
                    <Button
                      title={t("deleteAppointment")}
                      className="h-[34px] w-[34px] border-danger !p-[0px]"
                      isDisabled={isLoading}
                      requestAction="compact"
                      requestPending={isLoading}
                      onClick={() =>
                        deleteDBAppointmentFn(
                          booked_appointment.id,
                          booked_appointment.booking_date,
                          booked_appointment.booking_time_MSK,
                        )
                      }>
                      <MdOutlineCancel className="text-danger" size={16} />
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
