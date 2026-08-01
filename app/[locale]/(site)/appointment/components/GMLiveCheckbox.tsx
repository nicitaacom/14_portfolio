"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { twMerge } from "tailwind-merge"
import { toggleIsGMAction } from "../../actions/toggleIsGMAction"

export function GMLiveCheckbox({ isGMLive }: { isGMLive: boolean }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function toggleAcceptMessagesFn() {
    try {
      setIsLoading(true)
      await toggleIsGMAction()
    } catch (error) {
      console.log(17, "error toggling isGMLive", error)
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  return (
    <label
      className={twMerge(
        `relative w-[36px] h-[20px] border-[3px] hover:brightness-75 transition-all duration-300
         rounded-[12px] cursor-pointer mx-1 flex overflow-hidden`,
        isLoading && "opacity-50 cursor-default pointer-events-none flex justify-center items-center",
      )}>
      <input
        className="hidden peer/input"
        type="checkbox"
        id="check"
        checked={isGMLive}
        onChange={toggleAcceptMessagesFn}
      />
      <span
        className={`absolute left-[2px] top-[2px] rounded-[50%]
      w-[10px] h-[10px] bg-danger transition-all duration-500
      before:absolute before:content-['']
      peer-checked/input:translate-x-[16px] peer-checked/input:bg-success
      `}
      />
    </label>
  )
}
