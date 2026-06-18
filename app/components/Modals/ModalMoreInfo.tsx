"use client"

import { useState, ReactElement } from "react"
import Image from "next/image"
import { Button } from "../Button"
import { ModalContainer } from "./ModalContainer"
import { CollaborationIcon } from "../CollaborationIcon"

import { PiTelegramLogoBold } from "react-icons/pi"
import { RiDiscordLine } from "react-icons/ri"
import { FiCalendar, FiUsers, FiFileText, FiExternalLink } from "react-icons/fi"
import { useScopedI18n } from "@/locales/client"

export interface Collaborator {
  name?: string
  imgSrc?: string
  profileUrl?: string
  description: string | ReactElement
}

interface ModalInfoProps {
  isOpen: boolean
  onClose: () => void
  label: string
  collaborators: Collaborator[]
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
  collaborators,
  siteUrl,
}: ModalInfoProps) {
  const t = useScopedI18n("projectModal")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = collaborators[selectedIndex]
  const selectedName = selected?.name ?? "nicitaacom"
  const selectedImgSrc = selected?.imgSrc ?? "/collaborations/web-avatar.jpg"
  const selectedProfileUrl = selected?.profileUrl ?? "https://github.com/nicitaacom"

  return (
    <ModalContainer
      className="max-w-[calc(100vw-2rem)] tablet:max-w-[700px] laptop:max-w-[850px] max-h-[85vh] flex flex-col"
      isOpen={isOpen}
      onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-lg pt-lg pb-sm shrink-0">
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
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-lg pb-lg space-y-lg">

          {/* Properties Grid */}
          <div className="grid grid-cols-1 gap-y-sm text-sm border-y border-secondary-foreground/5 py-md">
            {/* Collaboration Property */}
            <div className="flex items-start gap-x-md">
              <div className="flex items-center gap-x-sm w-[140px] text-secondary-foreground/40 font-medium shrink-0 pt-[11px]">
                <FiUsers className="shrink-0" size={16} />
                <span>{t("collaboration")}</span>
              </div>
              <div className="flex flex-col gap-y-sm flex-1 min-w-0">
                <div className="flex flex-row gap-md">
                  {collaborators.map((c, i) => (
                    <CollaborationIcon
                      key={i}
                      name={c.name}
                      imgSrc={c.imgSrc}
                      profileUrl={c.profileUrl}
                      isSelected={selectedIndex === i}
                      onClick={() => setSelectedIndex(i)}
                    />
                  ))}
                </div>
                {/* Detail panel for selected collaborator */}
                <div className="w-full bg-secondary-foreground/5 rounded-md overflow-hidden">
                  {selected && (
                    <>
                      <div className="flex items-center gap-x-sm p-sm border-b border-secondary-foreground/10">
                        <Image
                          className="w-[32px] h-[32px] rounded-full shrink-0"
                          src={selectedImgSrc}
                          alt={selectedName}
                          width={32}
                          height={32}
                        />
                        <button
                          type="button"
                          className="flex items-center gap-x-xs text-sm font-semibold text-secondary-foreground/80 hover:text-secondary transition-colors duration-200 w-fit"
                          onClick={() => window.open(selectedProfileUrl)}>
                          {selectedName}
                          <FiExternalLink size={12} className="opacity-50" />
                        </button>
                      </div>
                      <div className="h-[120px] overflow-y-scroll p-sm text-sm text-secondary-foreground/60 whitespace-pre-line">
                        {selected.description}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Deadline Property */}
            {deadline && (
              <div className="group flex items-center gap-x-md">
                <div className="flex items-center gap-x-sm w-[140px] text-secondary-foreground/40 font-medium">
                  <FiCalendar className="shrink-0" size={16} />
                  <span>{t("deadline")}</span>
                </div>
                <div className="flex-1 font-medium text-secondary-foreground/80">{deadline}</div>
              </div>
            )}
          </div>

          {/* Task / Description */}
          {taskLabel && (
            <section className="space-y-sm pb-lg">
              <div className="flex items-center gap-x-sm text-xs font-bold uppercase tracking-widest text-secondary-foreground/30">
                <FiFileText size={14} />
                <span>{t("projectTask")}</span>
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
            {t("similarSite")}
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
