"use client"

import { useState } from "react"
import { GrSchedule } from "react-icons/gr"
import { AnimatePresence, motion } from "framer-motion"
import { twMerge } from "tailwind-merge"

import { Skill } from "@/components/Skill"
import { TooltipOther, TooltipReact } from "@/components/Tooltips"
import { TooltipText } from "@/components/Tooltips/TooltipText"
import { ProjectsSwitcher } from "@/components/ProjectsSwitcher"
import { Footer } from "@/components/Footer"
import { hours } from "@/data/hours-and-applications"
import { Button } from "@/components/Button"
import { NewYearFilmStrip } from "@/components/NewYear/NewYearFilmStrip"
import { useScopedI18n } from "@/locales/client"

type Tab = "offer" | "story" | "whyme"
type Audience = "business" | "agency" | "developers"

export function HomePageView() {
  const [activeTab, setActiveTab] = useState<Tab>("offer")
  const [openAudience, setOpenAudience] = useState<Audience>("business")

  const t = useScopedI18n("home")
  const commonT = useScopedI18n("common")
  const skillsT = useScopedI18n("skills")

  const audiences: { key: Audience; label: string; items: string[] }[] = [
    {
      key: "business",
      label: t("audiences.business.label"),
      items: [t("audiences.business.item1"), "", t("audiences.business.item3")],
    },
    {
      key: "agency",
      label: t("audiences.agency.label"),
      items: [t("audiences.agency.item1"), t("audiences.agency.item2")],
    },
    {
      key: "developers",
      label: t("audiences.developers.label"),
      items: [t("audiences.developers.item1"), t("audiences.developers.item2")],
    },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: "offer", label: t("tabs.offer") },
    { key: "story", label: t("tabs.story") },
    { key: "whyme", label: t("tabs.whyme") },
  ]

  return (
    <>
      <div className="my-xl flex flex-col items-center justify-center gap-y-xl">
        <div
          className="flex w-full flex-col items-center justify-between gap-lg px-sm
      tablet:px-md desktop:h-[40rem] desktop:max-w-[80%] desktop:flex-row">
          <ul className="workbench-board flex flex-col gap-y-sm rounded-[4px] p-md">
            <Skill id={1} label="html&css" hours={hours.htmlcss} />
            <Skill id={2} label="React" hours={hours.next + hours.vite} tooltip tooltiptext={<TooltipReact />} />
            <Skill id={4} label="Next" hours={hours.next} />
            <Skill id={3} label="TypeScript" hours={hours.typescript} />
            <Skill
              id={5}
              label={skillsT("other")}
              hours={Object.values(hours.other).reduce((a, b) => a + b, 0)}
              tooltip
              tooltiptext={<TooltipOther />}
            />
          </ul>

          <div className="new-year-home-panel machine-panel flex h-[520px] w-full max-w-[650px] flex-col p-md desktop:text-start">
            <h1 data-text="WEB Frontend developer" className="text-shadow text-lg before:text-secondary">
              {t("role")}
            </h1>
            <p className="text-sm font-bold text-secondary-foreground/60">nicitaacom</p>

            <div className="new-year-home-tabs mt-md flex gap-md border-b border-primary-foreground">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={twMerge(
                    "border-b-2 pb-xs text-sm font-bold transition-colors duration-200",
                    activeTab === key
                      ? "border-cta text-cta"
                      : "border-transparent text-secondary-foreground hover:text-secondary",
                  )}>
                  {label}
                </button>
              ))}
            </div>

            <div className="new-year-home-body mt-md flex min-h-0 flex-1 flex-col justify-between text-md font-bold text-secondary-foreground">
              {activeTab === "story" ? (
                <div className="leading-relaxed">
                  <b>{t("story.startedLabel")}</b> {t("story.startedText")}
                  <br />
                  <b>{t("story.stackLabel")}</b> {t("story.stackText")}
                  <br />
                  <b>{t("story.createLabel")}</b> {t("story.createTextPrefix")}&nbsp;
                  <TooltipText
                    label={t("story.conversionLabel")}
                    tooltip={<h1 className="text-sm tablet:text-xs max-w-[220px]">{t("story.conversionTooltip")}</h1>}
                  />
                  &nbsp;{t("story.createTextSuffix")}
                  <br />
                  {t("story.messagePrefix")}&nbsp;
                  <TooltipText
                    label={t("story.messageLabel")}
                    tooltip={
                      <h2 className="whitespace-pre-line text-sm tablet:text-xs">{t("story.messageTooltip")}</h2>
                    }
                  />
                  &nbsp;{t("story.messageSuffix")}
                </div>
              ) : activeTab === "whyme" ? (
                <div className="flex flex-col gap-sm text-start">
                  <ul className="flex list-disc flex-col gap-xs pl-xl text-sm font-bold">
                    <li>{t("whyme.item1")}</li>
                    <li>{t("whyme.item2")}</li>
                    <li>{t("whyme.item3")}</li>
                  </ul>
                  <p className="pl-xs text-xs italic text-secondary-foreground/50">{t("whyme.note")}</p>
                </div>
              ) : (
                <div className="new-year-audience-list flex flex-col gap-xs text-start">
                  {audiences.map(({ key, label, items }) => (
                    <div key={key} className="new-year-audience-card machine-bezel overflow-hidden">
                      <button
                        onClick={() => setOpenAudience(key)}
                        className={twMerge(
                          "new-year-audience-trigger flex w-full items-center justify-between px-md py-sm text-xs font-bold uppercase tracking-widest transition-colors duration-200",
                          openAudience === key ? "text-cta" : "text-secondary-foreground/60 hover:text-secondary",
                        )}>
                        {label}
                        <span className="text-base">{openAudience === key ? "−" : "+"}</span>
                      </button>

                      <AnimatePresence initial={false}>
                        {openAudience === key && (
                          <motion.div
                            key={key}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}>
                            <ul className="flex list-disc flex-col gap-xs pb-sm pl-xl pr-md text-sm font-bold">
                              {items.map((item, i) => (
                                <li
                                  key={i}
                                  className={item === t("audiences.developers.item2") ? "font-normal opacity-60" : ""}>
                                  {key === "business" && i === 1 ? (
                                    <>
                                      {t("audiences.business.item2Prefix")}&nbsp;
                                      <span className="underline underline-offset-2">
                                        {t("audiences.business.item2FastLabel")}
                                      </span>
                                    </>
                                  ) : (
                                    item
                                  )}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              <div className="new-year-cta-row">
                <Button className="mt-md w-fit px-[1.5rem]" href="/appointment">
                  {commonT("bookAppointment")} <GrSchedule />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[80vw] flex-col gap-xl">
          <NewYearFilmStrip />
          <ProjectsSwitcher />
        </div>
      </div>
      <Footer />
    </>
  )
}
