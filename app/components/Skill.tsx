"use client"

import { RefObject, useLayoutEffect, useRef } from "react"
import { ISkill } from "../interfaces/Skill"
import CountUp from "react-countup"
import gsap from "gsap"

export function Skill(skill: ISkill) {
  const progressRef: RefObject<HTMLDivElement | null> = useRef(null)

  useLayoutEffect(() => {
    const maxHours = 10000
    const percent = (skill.hours / maxHours) * 100
    const rootStyles = getComputedStyle(document.documentElement)
    const rampColor = (token: string) => rootStyles.getPropertyValue(token).trim()

    // 6 fixed bands across 0–100%: each spans 100/6 ≈ 16.67%.
    // Color snaps to whichever band the bar's CURRENT fill sits in,
    // so as the bar grows it sweeps red → orange → … → violet.
    const band = 100 / 6
    const colorForFill = (fill: number) => {
      if (fill > band * 5) return rampColor("--skill-ramp-6") // violet
      if (fill > band * 4) return rampColor("--skill-ramp-5") // turquoise
      if (fill > band * 3) return rampColor("--skill-ramp-4") // green
      if (fill > band * 2) return rampColor("--skill-ramp-3") // yellow
      if (fill > band * 1) return rampColor("--skill-ramp-2") // orange
      return rampColor("--skill-ramp-1") // red
    }

    if (!progressRef.current) return

    gsap.set(progressRef.current, { width: "0%", background: colorForFill(0) })
    const tween = gsap.to(progressRef.current, {
      width: `${percent}%`,
      duration: 5,
      ease: "power1.inOut",
      onUpdate: function () {
        const fill = parseFloat((this.targets()[0] as HTMLDivElement).style.width)
        if (progressRef.current) progressRef.current.style.background = colorForFill(fill)
      },
    })

    return () => {
      tween.kill()
    }
  }, [skill.hours])

  return (
    <li
      className={`flex ${
        skill.small ? "w-[200px] h-[15px]" : "w-[300px] tablet:w-[450px] desktop:w-[425px] h-[22.5px]"
      } gap-xs select-none`}
      key={skill.id}>
      <div
        className={`site-label tape-label relative flex justify-end items-center text-end text-secondary font-bold whitespace-nowrap px-xs
        ${skill.small ? skill.labelClassName : "min-w-[32%]"}`}>
        {skill.label}
      </div>
      <div className="site-progress machine-bezel relative w-full overflow-hidden">
        <div className="h-full w-[0px] shadow-[inset_0px_2px_2px_rgba(0,0,0,0.3)]" ref={progressRef} />
        <CountUp
          className="absolute top-[50%] right-[4%] -translate-y-1/2 text-xs font-bold text-secondary-foreground"
          end={skill.hours}
          duration={5}
          delay={0.5}
          separator=""
          suffix="h"
        />
      </div>
    </li>
  )
}
