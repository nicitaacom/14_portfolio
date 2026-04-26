"use client"

import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import type { TTrackedProject } from "@/interfaces/TTrackedProject"
import { Input } from "@/components/Input"
import { useProjectClicksDashboard } from "../../store/useProjectClicksDashboard"
import { useScopedI18n } from "@/locales/client"

interface DropdownContentProps {
  closeDropdown: () => void
  isShowDropdown: boolean
  projects: TTrackedProject[]
}

export function DropdownContent({ closeDropdown, isShowDropdown, projects }: DropdownContentProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const { selectedProjectSlug, setSelectedProjectSlug } = useProjectClicksDashboard()
  const t = useScopedI18n("admin")

  const filteredProjects = useMemo(() => {
    const normalizedValue = searchInput.toLowerCase().trim()

    if (!normalizedValue) return projects

    return [...projects]
      .filter(
        project =>
          project.name.toLowerCase().includes(normalizedValue) ||
          project.shortName.toLowerCase().includes(normalizedValue),
      )
      .sort((a, b) => a.name.toLowerCase().indexOf(normalizedValue) - b.name.toLowerCase().indexOf(normalizedValue))
  }, [projects, searchInput])

  function changeSelectedProject(projectSlug: string) {
    setSelectedProjectSlug(projectSlug)
    closeDropdown()
  }

  return (
    <div
      className={twMerge(
        "absolute left-0 top-[calc(100%+8px)] w-full rounded-[2px] border border-[#343434] bg-[#242424] p-[6px] shadow-[0_16px_44px_rgba(0,0,0,0.22)]",
        isShowDropdown
          ? "visible translate-y-[0px] opacity-100 transition-all duration-200"
          : "invisible translate-y-[-12px] opacity-0 transition-all duration-200",
      )}
      onClick={event => event.stopPropagation()}
      onMouseLeave={() => setHoveredSlug(null)}>
      <Input
        className="w-full rounded-[2px] border-[#343434] bg-[#2a2a2a] text-sm text-secondary placeholder:text-secondary-foreground focus:border-[#4a4a4a]"
        placeholder={t("searchProject")}
        value={searchInput}
        onChange={event => setSearchInput(event.target.value)}
        onClick={event => event.stopPropagation()}
      />

      <div className="max-h-[240px] overflow-y-scroll hide-scrollbar pt-[6px]">
        {!filteredProjects.length ? (
          <p className="px-sm py-sm text-sm text-secondary-foreground">{t("noProjectsFound")}</p>
        ) : null}
        {filteredProjects.map((project, index) => {
          const isActive = hoveredSlug ? hoveredSlug === project.slug : selectedProjectSlug === project.slug

          return (
            <li
              className={twMerge(
                "flex items-center justify-between gap-xs rounded-[2px] px-sm py-[10px] text-sm duration-150",
                index > 0 && "mt-[2px]",
                isActive ? "bg-[#3a3a3a]" : "hover:bg-[#2f2f2f]",
              )}
              key={project.slug}
              onMouseOver={() => setHoveredSlug(project.slug)}
              onClick={() => changeSelectedProject(project.slug)}>
              <span className="truncate text-secondary">{project.name}</span>
              <span className="shrink-0 rounded-full border border-[#4a4a4a] bg-[#2a2a2a] px-[8px] py-[3px] text-[10px] uppercase tracking-[0.18em] text-secondary-foreground">
                {project.group === "work" ? t("work") : t("projects")}
              </span>
            </li>
          )
        })}
      </div>
    </div>
  )
}
