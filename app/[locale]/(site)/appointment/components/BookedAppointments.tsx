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
import { deleteDBAppointmentAction } from "../../actions/deleteDBAppointmentAction"
import { Button } from "@/components/Button"
import { updateDBAppointmentAction } from "../../actions/updateDBAppointmentAction"
import { Input } from "@/components/Input"
import useToast from "@/store/useToast"
import { useScopedI18n } from "@/locales/client"

export function BookedAppointments({ booked_appointments }: { booked_appointments: BookingsResponse[] }) {
  const { selectedTimezone } = useSelectedTimezoneStore()
  const toast = useToast()
  const t = useScopedI18n("appointment.page")
  const commonT = useScopedI18n("common")
  const toastT = useScopedI18n("toast")
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
        toast.show("error", toastT("defaultErrorTitle"), error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[680px] laptop:sticky laptop:top-[6rem] laptop:max-w-none">
      <div className="rounded-[16px] border border-[#555555] bg-[#202020] p-sm shadow-[0_18px_54px_rgba(0,0,0,0.18)]">
        <div className="mb-xs">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary">
            {t("scheduledAppointments")}
          </p>
          <p className="mt-[4px] max-w-[22rem] text-sm leading-relaxed text-secondary-foreground/75">
            {t("scheduledAppointmentsSubtitle")}
          </p>
        </div>

        <ul className="flex flex-col gap-xs">
          {!booked_appointments.length && (
            <li className="rounded-[10px] border border-[#4c4c4c] bg-[#1c1c1c] px-sm py-sm text-sm leading-relaxed text-secondary-foreground">
              {t("noAppointments")}
            </li>
          )}
          {booked_appointments.map(booked_appointment => (
            <li
              className="flex min-w-0 flex-col gap-xs rounded-[10px] border border-[#4c4c4c] bg-[#1c1c1c] px-sm py-sm"
              key={booked_appointment.id}>
              <div className="flex flex-col gap-xs">
                {editingAppointmentId === booked_appointment.id ? (
                  <div className="flex flex-col gap-y-xs">
                    <div className="flex flex-col gap-xs tablet:flex-row">
                      <Input
                        className="min-w-0 w-full rounded-[9px] border-[#5d5d5d] bg-[#202020] text-secondary"
                        type="date"
                        value={draftBookingDate}
                        onChange={e => setDraftBookingDate(e.target.value)}
                      />
                      <Input
                        className="min-w-0 w-full rounded-[9px] border-[#5d5d5d] bg-[#202020] text-secondary"
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
                      className="h-[34px] w-[34px] rounded-[9px] border-success bg-[#1e2b21] p-0"
                      isDisabled={isLoading || !draftBookingDate || !draftBookingTime}
                      onClick={() => updateDBAppointmentFn(booked_appointment)}>
                      <FiSave className="text-success" />
                    </Button>
                    <Button
                      title={t("cancelEdit")}
                      className="h-[34px] w-[34px] rounded-[9px] border-secondary-foreground bg-[#232323] p-0"
                      isDisabled={isLoading}
                      onClick={stopEditing}>
                      <MdOutlineCancel />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      title={t("editAppointment")}
                      className="h-[34px] w-[34px] rounded-[9px] border-cta bg-[#261f2f] p-0"
                      isDisabled={isLoading}
                      onClick={() => startEditing(booked_appointment)}>
                      <FiEdit3 className="text-cta" />
                    </Button>
                    <Button
                      title={t("deleteAppointment")}
                      className="h-[34px] w-[34px] rounded-[9px] border-danger bg-[#2a1f21] p-0"
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
