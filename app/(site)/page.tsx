"use client"

import { useState } from "react"
import { GrSchedule } from "react-icons/gr"
import { Skill } from "@/components/Skill"
import { TooltipOther, TooltipReact } from "../components/Tooltips"
import { ProjectsSwitcher } from "@/components/ProjectsSwitcher"
import { Footer } from "@/components/Footer"
import { hours } from "@/data/hours"
import { Button } from "@/components/Button"
import { twMerge } from "tailwind-merge"
import { AnimatePresence, motion } from "framer-motion"

type Tab = "offer" | "story" | "whyme"
type Audience = "business" | "agency" | "developers"

const AUDIENCES: { key: Audience; label: string; content: React.ReactNode }[] = [
  {
    key: "business",
    label: "For business owners",
    content: (
      <ul className="flex flex-col gap-xs list-disc pl-xl pr-md pb-sm text-sm font-bold">
        <li>More clients with a website - or you don&apos;t pay</li>
        <li>
          Developer that builds your website/SaaS/microservices{" "}
          <span className="underline underline-offset-2">fast</span>
        </li>
        <li>Implement AI on demand</li>
      </ul>
    ),
  },
  {
    key: "agency",
    label: "For agency owners",
    content: (
      <ul className="flex flex-col gap-xs list-disc pl-xl pr-md pb-sm text-sm font-bold">
        <li>Help with outreach to get clients</li>
        <li>Advice about SMMA</li>
      </ul>
    ),
  },
  {
    key: "developers",
    label: "For developers",
    content: (
      <ul className="flex flex-col gap-xs list-disc pl-xl pr-md pb-sm text-sm font-bold">
        <li>Consulting &amp; advice on how to code</li>
        <li className="opacity-60 font-normal">React · Next.js · TypeScript · Tailwind</li>
      </ul>
    ),
  },
]

const TABS: { key: Tab; label: string }[] = [
  { key: "offer", label: "My Offer" },
  { key: "story", label: "My Story" },
  { key: "whyme", label: "Why me?" },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("offer")
  const [openAudience, setOpenAudience] = useState<Audience>("business")

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-y-xl my-xl">
        {/* Skills + Text */}
        <div
          className="flex flex-col desktop:flex-row justify-between items-center gap-lg w-full px-sm
      tablet:px-md desktop:max-w-[80%] desktop:h-[40rem]">
          {/* Skills */}
          <ul className="flex flex-col gap-y-sm bg-primary-foreground p-md border rounded">
            <Skill id={1} label="html&css" hours={hours.htmlcss} />
            <Skill id={2} label="React" hours={hours.next + hours.vite} tooltip tooltiptext={<TooltipReact />} />
            <Skill id={4} label="Next" hours={hours.next} />
            <Skill id={3} label="TypeScript" hours={hours.typescript} />
            <Skill
              id={5}
              label="other"
              hours={Object.values(hours.other).reduce((a, b) => a + b, 0)}
              tooltip
              tooltiptext={<TooltipOther />}
            />
          </ul>
          {/* Text */}
          <div className="flex flex-col w-full max-w-[650px] desktop:text-start" style={{ aspectRatio: "16/9" }}>
            <h1 data-text="WEB Frontend developer" className="text-shadow text-lg before:text-secondary">
              Teamlead WEB developer
            </h1>
            <p className="text-sm text-secondary-foreground/60 font-bold">nicitaacom</p>
            {/* Tabs */}
            <div className="flex gap-md mt-md border-b border-primary-foreground">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={twMerge(
                    "text-sm font-bold transition-colors duration-200 pb-xs border-b-2",
                    activeTab === key ? "text-cta border-cta" : "text-secondary-foreground border-transparent hover:text-secondary",
                  )}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-col flex-1 justify-between text-md font-bold text-secondary-foreground mt-md min-h-[260px]">
              {activeTab === "story" ? (
                <div className="leading-relaxed">
                  <b>I started</b> my career in 2018 and tried 4 different programming languages.
                  <br />
                  <b>My main stack</b> — Next + TypeScript + Tailwind
                  <br />
                  <b>I create</b> websites with a high&nbsp;
                  <div className="relative inline-block">
                    <span data-text="conversion" className="text-tooltip tooltip">
                      <div className="tooltiptext">
                        <h1 className="text-sm tablet:text-xs whitespace-nowrap">
                          When 100 people visit your site
                          <br /> and only 1 of them buy smth
                          <br className="tablet:hidden" /> - it means conversion rate = 1%
                        </h1>
                      </div>
                    </span>
                  </div>
                  &nbsp;rate and amazing UI/UX/CX
                  <br />
                  Here is a&nbsp;
                  <div className="relative inline-block">
                    <span data-text="message" className="text-tooltip tooltip">
                      <div className="tooltiptext">
                        <h2 className="text-sm tablet:text-xs">
                          <b>I dropped</b> my academy and want
                          <br className="tablet:hidden" /> to say people
                          <br className="hidden tablet:block" /> in young age that knowlege
                          <br className="tablet:hidden" /> that you get in&nbsp;
                          <br className="hidden tablet:block" />
                          <i>school/colledge/academy</i>
                          <br className="tablet:hidden" /> don&apos;t help you to get{" "}
                          <br className="hidden tablet:block" />
                          success in your life
                          <br className="tablet:hidden" /> - that&apos;s why you need invest your
                          <br /> free time in vision in your head
                          <br className="tablet:hidden" /> of how to get success.
                          <br />
                        </h2>
                      </div>
                    </span>
                  </div>
                  &nbsp;I want to share
                </div>
              ) : activeTab === "whyme" ? (
                <div className="flex flex-col gap-sm text-start">
                  <ul className="flex flex-col gap-xs list-disc pl-xl text-sm font-bold">
                    <li>8 years of experience</li>
                    <li>Get results or you don&apos;t pay</li>
                    <li>Russian / Ukrainian / English / German / Polish</li>
                  </ul>
                  <p className="text-xs text-secondary-foreground/50 italic pl-xs">
                    Even if you don&apos;t want to buy anything — book a call to get a fresh perspective and useful info.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-xs text-start">
                  {AUDIENCES.map(({ key, label, content }) => (
                    <div key={key} className="rounded bg-primary-foreground overflow-hidden">
                      <button
                        onClick={() => setOpenAudience(key)}
                        className={twMerge(
                          "w-full flex justify-between items-center px-md py-sm text-xs uppercase tracking-widest font-bold transition-colors duration-200",
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
                            {content}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-fit px-[1.5rem] mt-md" href="/appointment">
                Book appointment <GrSchedule />
              </Button>
            </div>
          </div>
        </div>

        {/* Protfolio projects */}
        <div className="flex flex-col gap-xl max-w-[80vw] w-full">
          <ProjectsSwitcher />
        </div>
      </div>
      <Footer />
    </>
  )
}
