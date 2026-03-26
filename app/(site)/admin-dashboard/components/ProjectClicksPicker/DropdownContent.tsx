"use client"

import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import type { TTrackedProject } from "@/interfaces/TTrackedProject"
import { Input } from "@/components/Input"
import { useProjectClicksDashboard } from "../../store/useProjectClicksDashboard"

interface DropdownContentProps {
  closeDropdown: () => void
  isShowDropdown: boolean
  projects: TTrackedProject[]
}

export function DropdownContent({ closeDropdown, isShowDropdown, projects }: DropdownContentProps) {
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
        "absolute left-0 top-[calc(100%+8px)] w-full rounded-[16px] border border-[#223049] bg-[#0d1424] p-[6px] shadow-[0_24px_60px_rgba(2,8,20,0.45)]",
        isShowDropdown
          ? "visible translate-y-[0px] opacity-100 transition-all duration-200"
          : "invisible translate-y-[-12px] opacity-0 transition-all duration-200",
      )}
      onClick={event => event.stopPropagation()}
      onMouseLeave={() => setHoveredSlug(null)}>
      <Input
        className="w-full rounded-[10px] border-[#1c2940] bg-[#101829] text-sm text-[#eff5ff] placeholder:text-[#687790] focus:border-[#35548c]"
        placeholder="Search project..."
        value={searchInput}
        onChange={event => setSearchInput(event.target.value)}
        onClick={event => event.stopPropagation()}
      />

      <div className="max-h-[240px] overflow-y-scroll hide-scrollbar pt-[6px]">
        {!filteredProjects.length ? <p className="px-sm py-sm text-sm text-[#8090ab]">No projects found.</p> : null}
        {filteredProjects.map((project, index) => {
          const isActive = hoveredSlug ? hoveredSlug === project.slug : selectedProjectSlug === project.slug

          return (
            <li
              className={twMerge(
                "flex items-center justify-between gap-xs rounded-[10px] px-sm py-[10px] text-sm duration-150",
                index > 0 && "mt-[2px]",
                isActive ? "bg-[#16233a]" : "hover:bg-[#111b2f]",
              )}
              key={project.slug}
              onMouseOver={() => setHoveredSlug(project.slug)}
              onClick={() => changeSelectedProject(project.slug)}>
              <span className="truncate text-[#eff5ff]">{project.name}</span>
              <span className="shrink-0 rounded-full border border-[#23314b] bg-[#101829] px-[8px] py-[3px] text-[10px] uppercase tracking-[0.18em] text-[#7d8ca6]">
                {project.group}
              </span>
            </li>
          )
        })}
      </div>
    </div>
  )
}
