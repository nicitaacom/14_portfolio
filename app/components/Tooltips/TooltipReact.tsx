import { hours } from "@/data/hours"
import { Skill } from "../Skill"

export function TooltipReact() {
  return (
    <div className="tooltiptext">
      <div className="flex flex-col justify-start items-center gap-y-sm w-[225px] h-fit">
        <Skill id={2.1} label="Next" hours={hours.next} labelClassName="min-w-[20%]" small />
        <Skill id={2.2} label="Vite" hours={hours.vite} labelClassName="min-w-[20%]" small />
      </div>
    </div>
  )
}
