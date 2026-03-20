import Link from "next/link"
import { FiVideo } from "react-icons/fi"

export function GoogleMeetsData() {
  return (
    <div className="w-full rounded-[12px] border border-[#777777] px-sm py-xs">
      <div className="flex items-start gap-xs">
        <FiVideo className="mt-[2px] text-cta" size={16} />
        <div className="min-w-0">
          <p className="text-sm text-secondary">Google Meets link</p>
          <Link className="break-all text-sm text-cta" href="https://meet.google.com/yiy-pbnd-ygo">
            https://meet.google.com/yiy-pbnd-ygo
          </Link>
        </div>
      </div>
    </div>
  )
}
