"use client"

import Link from "next/link"

import { repos } from "@/data/repos"
import { useSlider } from "@/hooks"

export function NavbarProjects() {
  const { handleMouseDown, handleMouseMove, handleTouchDown, handleTouchMove } = useSlider()

  return (
    <div
      className="hidden desktop:inline-flex overflow-x-hidden"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchDown}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}>
      <ul className="hidden desktop:inline-flex items-center gap-md">
        {repos.map(repo => (
          <li key={repo.id} className="flex flex-col items-center w-[10rem] select-none">
            <p className="flex justify-center">{repo.id}</p>
            <Link
              className="transition-all duration-200 ease-in hover:brightness-75 whitespace-nowrap"
              href={repo.url}
              target="_blank">
              {repo.description}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
