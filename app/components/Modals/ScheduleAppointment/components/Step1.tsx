import { ScheduleButtons } from "./ScheduleButtons"

export function Step1() {
  return (
    <div className="flex flex-col gap-sm">
      <p className="text-sm text-secondary-foreground">Pick one option to continue.</p>
      <ScheduleButtons />
    </div>
  )
}
