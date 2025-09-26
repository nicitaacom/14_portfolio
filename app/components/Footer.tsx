import { PiTelegramLogoBold } from "react-icons/pi"
import { RiDiscordLine } from "react-icons/ri"
import { AiFillLinkedin } from "react-icons/ai"
import { BsFiletypePdf } from "react-icons/bs"
import { GrSchedule } from "react-icons/gr"

import { Button } from "./Button"

export function Footer() {
  return (
    <footer className="mb-lg mt-auto">
      <div className="relative grid grid-cols-2 min-[882px]:flex gap-y-md max-w-[80vw] mx-auto justify-center gap-x-md">
        <Button href="https://t.me/nicitaacom" target="_blank">
          Telegram <PiTelegramLogoBold />
        </Button>
        <Button href="https://discord.com/users/780002958380498955" target="_blank">
          Discord <RiDiscordLine />
        </Button>
        <Button href="https://linkedin.com/in/nicitaacom" target="_blank">
          LinkedIn <AiFillLinkedin />
        </Button>
        <Button
          href="https://drive.google.com/file/d/1oGjYJEbqq4kUVSgq4P4D8J71r_tOHWMB/view?usp=sharing"
          target="_blank">
          Summary <BsFiletypePdf />
        </Button>
        <Button className="text-center col-span-2" href="/appointment">
          Book appointment <GrSchedule />
        </Button>
      </div>
    </footer>
  )
}
