"use client"

import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { useCloseOnClickEsc } from "@/hooks/useOnClickEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { DropdownContainerContent } from "./DropdownContainerContent"
import { DropdownContent } from "./DropdownContent"

export function TimeZonePicker() {
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
    <div className="flex w-full items-center justify-end tablet:w-[190px]">
      <div
        className={twMerge(
          `relative flex h-[40px] w-full items-center rounded-[8px] border border-[#777777]
           bg-primary/70 px-sm z-[111] cursor-pointer`,
        )}
        onClick={toggleDropdown}
        ref={dropdownContainerRef}>
        <DropdownContainerContent />
        <DropdownContent isShowDropdown={isShowDropdown} />
      </div>
    </div>
  )
}
