import { PiTelegramLogoBold } from "react-icons/pi";
import { Button } from "./Button";
import { RiDiscordLine } from "react-icons/ri";

export function Footer() {
  return (
    <footer className="mb-lg mt-auto">
      <div className="flex justify-center gap-x-md">
        <Button onClick={() => window.open('https://t.me/nicitaacom')}>Telegram <PiTelegramLogoBold /></Button>
        <Button onClick={() => window.open('https://discord.com/users/780002958380498955')}>Discord <RiDiscordLine /></Button>
      </div>
    </footer>
  )
}