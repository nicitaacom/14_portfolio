"use client"

import { Button } from "../Button"
import { ModalContainer } from "./ModalContainer"

import { PiTelegramLogoBold } from "react-icons/pi"
import { RiDiscordLine } from "react-icons/ri"
import { FiCalendar, FiUsers, FiFileText } from "react-icons/fi"

interface ModalInfoProps {
  isOpen: boolean
  onClose: () => void
  label: string
  collaborationChildren: React.ReactNode
  taskLabel?: string
  deadline?: string
  siteUrl: string
}

export function ModalMoreInfo({
  isOpen,
  onClose,
  label,
  taskLabel,
  deadline,
  collaborationChildren,
  siteUrl,
}: ModalInfoProps) {
  return (
    <ModalContainer
      className="max-w-[calc(100vw-2rem)] tablet:max-w-[700px] laptop:max-w-[850px] aspect-video flex flex-col"
      isOpen={isOpen}
      onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-lg py-lg space-y-lg">
          {/* Header */}
          <header className="space-y-sm">
            <h1 className="text-xl font-bold tracking-tight text-secondary-foreground">
              <a
                className="hover:text-secondary transition-colors duration-300"
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer">
                {label}
              </a>
            </h1>
          </header>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 gap-y-sm text-sm border-y border-secondary-foreground/5 py-md">
            {/* Collaboration Property */}
            <div className="group flex items-center gap-x-md">
              <div className="flex items-center gap-x-sm w-[140px] text-secondary-foreground/40 font-medium">
                <FiUsers className="shrink-0" size={16} />
                <span>Collaboration</span>
              </div>
              <div className="flex-1 text-secondary-foreground/80">{collaborationChildren}</div>
            </div>

            {/* Deadline Property */}
            {deadline && (
              <div className="group flex items-center gap-x-md">
                <div className="flex items-center gap-x-sm w-[140px] text-secondary-foreground/40 font-medium">
                  <FiCalendar className="shrink-0" size={16} />
                  <span>Deadline</span>
                </div>
                <div className="flex-1 font-medium text-secondary-foreground/80">{deadline}</div>
              </div>
            )}
          </div>

          {/* Task / Description */}
          {taskLabel && (
            <section className="space-y-sm">
              <div className="flex items-center gap-x-sm text-xs font-bold uppercase tracking-widest text-secondary-foreground/30">
                <FiFileText size={14} />
                <span>Project Task</span>
              </div>
              <p className="text-base leading-relaxed text-secondary-foreground/70 whitespace-pre-wrap">
                {taskLabel}
              </p>
            </section>
          )}
        </div>

        {/* CTA Footer */}
        <footer className="mt-auto p-md bg-secondary-foreground/[0.02] border-t border-secondary-foreground/5 flex flex-col items-end gap-y-sm shrink-0">
          <p className="text-sm font-medium text-secondary-foreground/40 italic">
            Want similar site? Message me:
          </p>
          <div className="flex items-center gap-x-sm">
            <Button
              className="text-xs py-xs px-sm"
              onClick={() => window.open("https://discord.com/users/780002958380498955")}>
              Discord <RiDiscordLine size={18} />
            </Button>
            <Button
              className="text-xs py-xs px-sm"
              onClick={() => window.open("https://t.me/nicitaacom")}>
              Telegram <PiTelegramLogoBold size={18} />
            </Button>
          </div>
        </footer>
      </div>
    </ModalContainer>
  )
}
