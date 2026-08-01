"use client"

import { useMemo, useRef, useState } from "react"
import type { TTrackedProject } from "@/interfaces/TTrackedProject"
import { useCloseOnEsc } from "@/hooks/useCloseOnEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { useProjectClicksDashboard } from "../../store/useProjectClicksDashboard"
import { DropdownContainerContent } from "./DropdownContainerContent"
import { DropdownContent } from "./DropdownContent"
import { useScopedI18n } from "@/locales/client"

interface ProjectClicksPickerProps {
  projects: TTrackedProject[]
}

export function ProjectClicksPicker({ projects }: ProjectClicksPickerProps) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const [isShowDropdown, setIsShowDropdown] = useState(false)
  const { selectedProjectSlug } = useProjectClicksDashboard()
  const t = useScopedI18n("admin")

  const selectedProjectName = useMemo(
    () => projects.find(project => project.slug === selectedProjectSlug)?.name ?? t("selectProject"),
    [projects, selectedProjectSlug, t],
  )

  function closeDropdown() {
    setIsShowDropdown(false)
  }

  function toggleDropdown() {
    setIsShowDropdown(!isShowDropdown)
  }

  useCloseOnClickOutside(dropdownContainerRef, closeDropdown)
  useCloseOnEsc(closeDropdown)

  return (
    <div className="flex w-full items-center justify-end tablet:w-[252px]">
      <div className="relative z-[111] w-full" ref={dropdownContainerRef}>
        <button
          className="flex h-[40px] w-full items-center rounded-[2px] border border-brass/40 bg-steel px-sm text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
          onClick={toggleDropdown}
          type="button">
          <DropdownContainerContent isShowDropdown={isShowDropdown} selectedProjectName={selectedProjectName} />
        </button>
        <DropdownContent closeDropdown={closeDropdown} isShowDropdown={isShowDropdown} projects={projects} />
      </div>
    </div>
  )
}
