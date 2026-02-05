import { useAppointmentStore } from "@/store/useAppointmentStore"
import { Checkbox } from "./Checkbox"
import { SendNotificationTo } from "./SendNotificationTo"
import { Button } from "@/components/Button"
import { twMerge } from "tailwind-merge"
import { useForm } from "react-hook-form"
import { bookACallFn } from "@/(site)/functions/bookACallFn"
import useToast from "@/store/useToast"
import { useState } from "react"
import { Input } from "@/components/Input"
import { IoMdArrowRoundForward } from "react-icons/io"
import { BsCheckLg } from "react-icons/bs"

interface FormData {
  inputNotificationTo: string
}

const validationRules = {
  email: {
    required: "This field is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Enter valid email address",
    },
  },
}

export function Step2() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    sendNotificationTo,
    isShowUpOnACall,
    isSendNotification,
    appointmentNote,
    step,
    setAppointmentNote,
    setInputNotificationTo,
    toggleIsShowUpOnACall,
    toggleIsSendNotification,
  } = useAppointmentStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    if (sendNotificationTo === "email" && !validationRules.email.pattern.value.test(data.inputNotificationTo)) {
      setError("inputNotificationTo", { type: "manual", message: validationRules.email.pattern.message })
    }
    setInputNotificationTo(data.inputNotificationTo)
    try {
      setIsLoading(true)
      await bookACallFn()
    } catch (error) {
      if (error instanceof Error) {
        toast.show("error", "Error", error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={twMerge("w-full flex flex-col justify-start gap-y-[1.5rem]", step === "step-1" ? "" : "pt-lg")}
      onSubmit={handleSubmit(onSubmit)}>
      <div className="font-bold flex flex-col gap-y-xs">
        <div className="flex flex-col items-start gap-y-2">
          <Checkbox
            isChecked={isShowUpOnACall}
            onChange={toggleIsShowUpOnACall}
            label="I affirm 99% I'll show up on a call"
          />
          <div className="flex flex-row items-start gap-x-2">
            <Checkbox isChecked={isSendNotification} onChange={toggleIsSendNotification} label="" />
            <div className="flex flex-col tablet:flex-row gap-xs -mt-2">
              <span className="text-sm">Send notification & data to</span>
              <SendNotificationTo register={register} errors={errors} setError={setError} />
              <p>or I create it on my own</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="appointmentNote">What motivates you book a call today?</label>
          <Input
            className="border-t-0 border-l-0 border-r-0 placeholder:font-medium px-xs font-medium"
            value={appointmentNote}
            onChange={e => setAppointmentNote(e.target.value)}
            placeholder="Give a bit of context here"
          />
        </div>
      </div>
      <div className="flex justify-start items-center">
        <Button
          className={twMerge(
            "w-fit flex flex-row gap-x-xs group",
            (!isShowUpOnACall || !isSendNotification || isLoading) && "pointer-events-none cursor-default opacity-50",
          )}
          type="submit">
          Book a call
          <IoMdArrowRoundForward className="group-hover:-translate-x-0.5 duration-300" />
        </Button>
      </div>
    </form>
  )
}
