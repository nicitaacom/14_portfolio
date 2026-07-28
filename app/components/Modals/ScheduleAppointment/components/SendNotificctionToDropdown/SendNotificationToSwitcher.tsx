"use client"

import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { useCloseOnClickEsc } from "@/hooks/useOnClickEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { DropdownContainerContent } from "./DropdownContainerContent"

export function SendNotificationToSwitcher() {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const [isShowDropdown, setIsShowDropdown] = useState(false)

  function closeDropdown() {
    setIsShowDropdown(false)
  }
  function toggleDropdown() {
    setIsShowDropdown(!isShowDropdown)
  }

  useCloseOnClickOutside(dropdownContainerRef, closeDropdown)
  useCloseOnClickEsc(closeDropdown)

  return (
    <div
      className="flex flex-row gap-x-2 justify-end desktop:justify-center items-center px-0 duration-300"
      style={{ width: "40px", height: "40px" }}>
      <div
        className={twMerge(
          `relative flex h-full w-full items-center justify-center rounded-[10px] border border-brass/40
           cursor-pointer z-[111]`,
        )}
        onClick={toggleDropdown}
        ref={dropdownContainerRef}>
        <DropdownContainerContent />
      </div>
    </div>
  )
}
