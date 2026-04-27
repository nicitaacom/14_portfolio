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
    <div className="w-full">
      <div
        className={twMerge(
          "relative z-[25] w-full",
        )}
        ref={dropdownContainerRef}>
        <DropdownContainerContent isShowDropdown={isShowDropdown} toggleDropdown={toggleDropdown} />
        <DropdownContent closeDropdown={closeDropdown} isShowDropdown={isShowDropdown} />
      </div>
    </div>
  )
}
