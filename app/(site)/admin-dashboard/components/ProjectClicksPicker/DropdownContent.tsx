"use client"

import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import type { TTrackedProject } from "@/interfaces/TTrackedProject"
import { Input } from "@/components/Input"
import { useProjectClicksDashboard } from "../../store/useProjectClicksDashboard"

interface DropdownContentProps {
  isShowDropdown: boolean
  projects: TTrackedProject[]
  closeDropdown: () => void
}

export function DropdownContent({ isShowDropdown, projects, closeDropdown }: DropdownContentProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const { selectedProjectSlug, setSelectedProjectSlug } = useProjectClicksDashboard()

  const filteredProjects = useMemo(() => {
    const normalizedValue = searchInput.toLowerCase().trim()

    if (!normalizedValue) return projects

    return [...projects]
      .filter(project => project.name.toLowerCase().includes(normalizedValue) || project.shortName.toLowerCase().includes(normalizedValue))
      .sort((a, b) => a.name.toLowerCase().indexOf(normalizedValue) - b.name.toLowerCase().indexOf(normalizedValue))
  }, [projects, searchInput])

  function changeSelectedProject(projectSlug: string) {
    setSelectedProjectSlug(projectSlug)
    closeDropdown()
  }

  return (
    <div
      className={twMerge(
        "absolute left-0 top-[calc(100%+6px)] w-full rounded-[8px] border border-[#4a4a4a] bg-[#1d1d1d]",
        isShowDropdown
          ? "visible translate-y-[0px] opacity-100 transition-all duration-300"
          : "invisible translate-y-[-20px] opacity-0 transition-all duration-300",
      )}
      onClick={event => event.stopPropagation()}
      onMouseLeave={() => setHoveredSlug(null)}>
      <Input
        style={{ border: "none", width: "100%" }}
        placeholder="Search project..."
        value={searchInput}
        onChange={event => setSearchInput(event.target.value)}
        onClick={event => event.stopPropagation()}
      />

      <div className="max-h-[240px] overflow-y-scroll hide-scrollbar">
        {!filteredProjects.length ? <p className="px-sm py-sm text-sm text-secondary-foreground">No projects found.</p> : null}
        {filteredProjects.map((project, index) => {
          const isActive = hoveredSlug ? hoveredSlug === project.slug : selectedProjectSlug === project.slug

          return (
            <li
              className={twMerge(
                "flex items-center justify-between gap-xs border-b border-[#3d3d3d] px-sm py-xs text-sm duration-150 hover:bg-[#2c2c2c]",
                index === 0 && "border-t",
                isActive && "bg-[#2f203d]",
              )}
              key={project.slug}
              onMouseOver={() => setHoveredSlug(project.slug)}
              onClick={() => changeSelectedProject(project.slug)}>
              <span className="truncate text-secondary">{project.name}</span>
              <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">{project.group}</span>
            </li>
          )
        })}
      </div>
    </div>
  )
}
