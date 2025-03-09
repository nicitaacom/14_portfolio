"use client"

import { Skill } from "@/components/Skill"
import { TooltipOther, TooltipReact } from "../components/Tooltips"
import { ProjectsSwitcher } from "@/components/ProjectsSwitcher"
import { Footer } from "@/components/Footer"
import { hours } from "@/data/hours"
import { Button } from "@/components/Button"
import { GrSchedule } from "react-icons/gr"

export default function Home() {
  return (
    <>
      <div className="flex flex-col justify-center items-center gap-y-xl my-xl">
        {/* Skills + Text */}
        <div
          className="flex flex-col desktop:flex-row justify-between items-center gap-lg w-full px-sm
      tablet:px-md desktop:max-w-[80%] desktop:h-[40rem]">
          <ul className="flex flex-col gap-y-sm">
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
          <div className="text-center w-fit break-words max-w-[650px] desktop:px-[0] desktop:text-start">
            <h1 data-text="WEB Frontend developer" className="text-shadow text-lg before:text-secondary">
              Teamlead WEB developer
            </h1>
            <div className="flex flex-col justify-center desktop:items-start items-center gap-md text-md font-bold text-secondary-foreground">
              <div>
                <b>I started</b> my career in 2018 and tried 4 different programming languages.
                <br />
                <b>My main stack</b> - Next + TypeScript + Tailwind
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
                &nbsp; rate and amazing UI/UX/CX
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
                &nbsp; I want to share
                <br />
              </div>
              {/* <b>I dropped</b> my academy and want to say people in young age that knowlege that you get in&nbsp;
            <i>school/colledge/academy</i> don&apos;t help you to get success in your life - that&apos;s why you need
            invest your free time in vision in your head of how to get success.
            <br /> */}
              <Button className="w-fit text-center col-span-2 px-[1.5rem]" href="/appointment">
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
