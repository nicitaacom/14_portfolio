"use server"

import { CreateScheduleCommand, SchedulerClient, Target } from "@aws-sdk/client-scheduler"
import moment from "moment-timezone"

import { Channel, SendNotificationTo } from "@/store/useAppointmentStore"
import { Value } from "@/store/useSelectedDateStore"
import { formatTime } from "@/utils/formatTime"

export async function scheduleTgNtfctnAction(
  message: string,
  selectedDate: Value,
  at: string,
  channel: Channel,
  sendNotificationTo: SendNotificationTo,
  inputNotificationTo: string,
) {
  const client = new SchedulerClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })

  const date = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
  if (!date) {
    console.error("Error: Missing date for scheduling")
    return
  }

  const bookingDate = moment(date).format("YYYY-MM-DD")
  const baseTime = moment.tz(`${bookingDate} ${at}`, "Europe/Moscow").seconds(0).milliseconds(0)

  if (baseTime.isBefore(moment())) {
    console.error("Error: Scheduling time is in the past")
    return
  }

  const scheduleTimes = [
    {
      suffix: "_10minBefore",
      time: baseTime.clone().subtract(10, "minutes"),
      msg: `Reminder about meeting in 10 minutes:\n${message}`,
    },
  ]

  for (const { suffix, time, msg } of scheduleTimes) {
    if (time.isBefore(moment())) {
      console.error(`Skipping schedule (${suffix}): target time is already in the past`)
      continue
    }

    const idName = `ScheduleTgNtfctn_${formatTime(time.toISOString()).replace(/[\s\/\.:]/g, "_")}${suffix}`
    try {
      const params = {
        Name: idName,
        ScheduleExpression: `at(${time.format("YYYY-MM-DDTHH:mm:ss")})`,
        ScheduleExpressionTimezone: "Europe/Moscow",
        Target: {
          Arn: `arn:aws:lambda:${process.env.NEXT_PUBLIC_AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:function:${process.env.NEXT_PUBLIC_LAMBDA_FN_NAME}`,
          RoleArn: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/14-portfolio`,
          Input: JSON.stringify({
            dateTime: formatTime(time.toISOString()),
            message: msg,
            channel,
            sendNotificationTo,
            inputNotificationTo,
            idName,
          }),
        } as Target,
        FlexibleTimeWindow: { Mode: "OFF" as const },
        State: "ENABLED" as const,
      }
      const command = new CreateScheduleCommand(params)
      const response = await client.send(command)
      console.log(73, `Scheduled (${suffix}):`, response)
    } catch (error) {
      console.error(75, `Error scheduling (${suffix}):`, error)
    }
  }
}
