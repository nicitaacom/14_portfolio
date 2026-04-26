import moment from "moment"

/**
 * @param currentTime 10:00
 * @param currentTimezone - Europe/Berlin
 * @param targetTimezone - Europe/Moscow
 * @returns something like HH:mm e.g 11:00
 * Because GMT+2 it's 10:00 and GMT+3 it's 11:00
 *
 */
export function convertCurrentToTargetTimezone(
  currentTime: string, // e.g 23:49
  currentTimezone: string, // e.g Europe/Berlin
  targetTimezone: string, // e.g Europe/Moscow
): string {
  const [hour, minute] = currentTime.split(":").map(Number)
  const timeCurrent = moment.tz({ hour, minute }, currentTimezone)
  const timeInTarget = timeCurrent.clone().tz(targetTimezone)
  return timeInTarget.format("HH:mm")
}
