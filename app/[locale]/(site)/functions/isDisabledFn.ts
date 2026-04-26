import moment from "moment"

export function isDisabledFn(time: string, targetDate: Date): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const [hour, minute] = time.split(":").map(Number)
  const selectedMoment = moment(targetDate).tz("Europe/Moscow").startOf("day")
  const currentMoment = moment().tz("Europe/Moscow")

  if (selectedMoment.isSame(currentMoment, "day")) {
    return hour < currentHour || (hour === currentHour && minute < currentMinute)
  }
  return false
}
