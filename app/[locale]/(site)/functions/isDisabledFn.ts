import moment from "moment-timezone"

export function isDisabledFn(time: string, targetDate: Date): boolean {
  const currentMoment = moment().tz("Europe/Moscow")
  const currentHour = currentMoment.hours()
  const currentMinute = currentMoment.minutes()

  const [hour, minute] = time.split(":").map(Number)
  const selectedMoment = moment(targetDate).tz("Europe/Moscow").startOf("day")

  if (selectedMoment.isSame(currentMoment, "day")) {
    return hour < currentHour || (hour === currentHour && minute < currentMinute)
  }
  return false
}
