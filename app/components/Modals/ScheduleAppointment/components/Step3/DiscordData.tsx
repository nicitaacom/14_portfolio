import { formatedDateTimeFn } from "@/(site)/functions/formatedDateTimeFn"
import Link from "next/link"
import { FaDiscord } from "react-icons/fa"

export function DiscordData() {
  return (
    <div className="w-full rounded-[12px] border border-[#777777] px-sm py-xs">
      <div className="flex items-start gap-xs">
        <FaDiscord className="mt-[2px] text-cta" size={16} />
        <div className="flex flex-col gap-[4px]">
          <p className="text-sm text-secondary">Discord</p>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            Reach me on
            <Link className="ml-[4px] text-cta" href="https://discord.com/users/780002958380498955" target="_blank">
              Discord
            </Link>
            . My username is <span className="text-secondary">nicitaacom</span>.
          </p>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            Just call me on Discord at <span className="text-secondary">{formatedDateTimeFn().trim()}</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
