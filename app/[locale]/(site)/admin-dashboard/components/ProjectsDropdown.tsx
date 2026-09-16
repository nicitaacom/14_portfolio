"use client"

import { useId, useRef, useState } from "react"
import { BiSolidDownArrow } from "react-icons/bi"
import { twMerge } from "tailwind-merge"
import type { TTrackedProject } from "@/interfaces/TTrackedProject"
import { useCloseOnEsc } from "@/hooks/useCloseOnEsc"
import { useCloseOnClickOutside } from "@/hooks/useOnClickOutside"
import { playAdminButtonSound } from "../utils/playAdminButtonSound"

interface ProjectsDropdownProps {
  projects: readonly TTrackedProject[]
  selectedProjectSlug: string
  onSelect: (projectSlug: string) => void
}

export function ProjectsDropdown({ projects, selectedProjectSlug, onSelect }: ProjectsDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const selectedProject = projects.find(project => project.slug === selectedProjectSlug) ?? projects[0]

  useCloseOnClickOutside(containerRef, () => setIsOpen(false))
  useCloseOnEsc(() => setIsOpen(false))

  function selectProject(projectSlug: string) {
    playAdminButtonSound(3)
    onSelect(projectSlug)
    setIsOpen(false)
  }

  return <div className="relative w-full" ref={containerRef}>
    <button
      aria-controls={menuId}
      aria-expanded={isOpen}
      className={twMerge(
        "flex min-h-[42px] w-full items-center justify-between gap-sm rounded-[5px] border border-[var(--3d-dot-c-4b535a)] bg-[var(--3d-dot-c-171b1e)] px-sm py-xs text-left text-[12px] text-[var(--3d-dot-c-e8ecef)] shadow-[inset_0_2px_3px_var(--3d-dot-c-0008)] transition-all duration-200 hover:border-[var(--3d-dot-c-85919a)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--3d-dot-c-e8edf1)]",
        isOpen && "border-[var(--3d-dot-c-85919a)] brightness-110",
      )}
      onClick={() => setIsOpen(open => !open)}
      type="button">
      <span className="truncate">{selectedProject?.name}</span>
      <BiSolidDownArrow className={twMerge("shrink-0 text-[10px] text-[var(--3d-dot-c-aebbc5)] transition-transform duration-200", isOpen && "rotate-180 text-[var(--3d-dot-c-e8ecef)]")} />
    </button>
    <div
      className={twMerge(
        "absolute left-0 top-[calc(100%+10px)] z-20 max-h-[260px] min-w-full overflow-y-auto rounded-[5px] border border-[var(--3d-dot-c-4b5157)] bg-[var(--3d-dot-c-25292d)] p-xs shadow-[0_16px_40px_var(--3d-dot-c-0008),inset_0_1px_0_var(--3d-dot-c-ffffff0e)] transition-all duration-200",
        isOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-[-8px] opacity-0",
      )}
      id={menuId}
      role="listbox">
      <div className="flex flex-col gap-xs">
        {projects.map(project => {
          const selected = project.slug === selectedProjectSlug
          return <button
            aria-selected={selected}
            className={twMerge(
              "flex min-h-[38px] w-full items-center justify-between gap-sm rounded-[4px] border border-transparent px-sm py-xs text-left text-[12px] text-[var(--3d-dot-c-dce2e7)] transition-colors duration-200 hover:border-[var(--3d-dot-c-515a63)] hover:bg-[var(--3d-dot-c-2a3136)]",
              selected && "border-[var(--3d-dot-c-515a63)] bg-[var(--3d-dot-c-171c20)] text-[var(--3d-dot-c-f2f4f5)]",
            )}
            key={project.slug}
            onClick={() => selectProject(project.slug)}
            role="option"
            type="button">
            <span className="truncate">{project.name}</span>
            {selected ? <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--3d-dot-c-f3f5f6)] shadow-[0_0_7px_var(--3d-dot-c-ecf4ff60)]" /> : null}
          </button>
        })}
      </div>
    </div>
  </div>
}
