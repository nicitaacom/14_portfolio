"use client"

import { useMemo, useRef, useState } from "react"
import type { TTrackedProject } from "@/interfaces/TTrackedProject"
import { useCloseOnClickEsc } from "@/hooks/useOnClickEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { useProjectClicksDashboard } from "../../store/useProjectClicksDashboard"
import { DropdownContainerContent } from "./DropdownContainerContent"
import { DropdownContent } from "./DropdownContent"

interface ProjectClicksPickerProps {
  projects: TTrackedProject[]
}

export function ProjectClicksPicker({ projects }: ProjectClicksPickerProps) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const [isShowDropdown, setIsShowDropdown] = useState(false)
  const { selectedProjectSlug } = useProjectClicksDashboard()

  const selectedProjectName = useMemo(
    () => projects.find(project => project.slug === selectedProjectSlug)?.name ?? "Select project",
    [projects, selectedProjectSlug],
  )

  function closeDropdown() {
    setIsShowDropdown(false)
  }

  function toggleDropdown() {
    setIsShowDropdown(!isShowDropdown)
  }

  useCloseOnClickOutside(dropdownContainerRef, closeDropdown)
  useCloseOnClickEsc(closeDropdown)

  return (
    <div className="flex w-full items-center justify-end tablet:w-[240px]">
      <div
        className="relative z-[111] flex h-[40px] w-full cursor-pointer items-center rounded-[8px] border border-[#4a4a4a] bg-[#202020] px-sm"
        onClick={toggleDropdown}
        ref={dropdownContainerRef}>
        <DropdownContainerContent selectedProjectName={selectedProjectName} />
        <DropdownContent closeDropdown={closeDropdown} isShowDropdown={isShowDropdown} projects={projects} />
      </div>
    </div>
  )
}
