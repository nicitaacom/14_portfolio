"use client"

import { useState } from "react"
import { twMerge } from "tailwind-merge"
import moment from "moment"

import { useSelectedTimezoneStore } from "@/store/useSelectedTimezoneStore"
import { Input } from "@/components/Input"
import { useSelectedTimeStore } from "@/store/useSelectedTimeStore"
import { appointmentTimesMSK } from "@/data/appointmentTimesMSK"

export function DropdownContent({ isShowDropdown }: { isShowDropdown: boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  const { selectedTimezone, setSelectedTimezone } = useSelectedTimezoneStore()
  const { setSelectedTime } = useSelectedTimeStore()
  const isHover = hover !== null

  function mouseHover(index: string) {
    return () => setHover(index)
  }

  function changeSelectedTimezone(index: string) {
    const mskTime = moment.tz(appointmentTimesMSK[0].time, "HH:mm", "Europe/Moscow")
    const convertedTime = mskTime.clone().tz(index).format("HH:mm")

    setSelectedTime(convertedTime) // Now it holds the converted time in the new timezone
    setSelectedTimezone(index) // Keeping only the timezone name
  }

  const timezones = moment.tz.names()

  const [searchInput, setSearchInput] = useState("")
  const filteredTimezones = filterTimezones(searchInput)

  function filterTimezones(input: string) {
    // Filter timezones based on the search input
    const filtered = timezones.filter(
      timezone => timezone.length <= 18 && timezone.toLowerCase().includes(input.toLowerCase()),
    )

    // Sort the filtered timezones by relevance
    filtered.sort((a, b) => {
      const indexA = a.toLowerCase().indexOf(input.toLowerCase())
      const indexB = b.toLowerCase().indexOf(input.toLowerCase())
      return indexA - indexB
    })

    return filtered
  }

  return (
    <div
      className={twMerge(
        "absolute left-0 top-[calc(100%+6px)] w-full rounded-[8px] border border-[#777777] bg-primary",
        isShowDropdown
          ? "opacity-100 visible translate-y-[0px] transition-all duration-300"
          : "opacity-0 invisible translate-y-[-20px] transition-all duration-300",
      )}
      onMouseLeave={() => setHover(null)}>
      {/* Search Input */}
      <Input
        style={{ border: "none", width: "100%" }}
        placeholder="Search timezones..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onClick={e => e.stopPropagation()}
      />
      <div className="max-h-[200px] overflow-y-scroll hide-scrollbar">
        {filteredTimezones.map((timezone, index) => (
          <li
            className={twMerge(
              "hover:bg-hover-color duration-150 text-center flex flex-row gap-x-2 justify-center items-center border-b border-[#777777]",
              index === 0 && "border-t",
              // if hover on border set border green (its some UI issue - just keep it as is)
              isHover ? hover === timezone && "bg-cta" : selectedTimezone === timezone && "bg-cta",
            )}
            onMouseOver={mouseHover(timezone)}
            onClick={() => changeSelectedTimezone(timezone)}
            key={timezone}>
            {timezone}
          </li>
        ))}
      </div>
    </div>
  )
}
