import { formatedDateTimeFn } from "@/(site)/functions/formatedDateTimeFn"
import Link from "next/link"
import { FaTelegramPlane } from "react-icons/fa"

export function TelegramData() {
  return (
    <div className="w-full rounded-[12px] border border-[#777777] px-sm py-xs">
      <div className="flex items-start gap-xs">
        <FaTelegramPlane className="mt-[2px] text-cta" size={16} />
        <div className="flex flex-col gap-[4px]">
          <p className="text-sm text-secondary">Telegram</p>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            Reach me on
            <Link className="ml-[4px] text-cta" href="https://t.me/nicitaacom" target="_blank">
              Telegram
            </Link>
            . My username is <span className="text-secondary">nicitaacom</span>.
          </p>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            Just call me on Telegram at <span className="text-secondary">{formatedDateTimeFn().trim()}</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
