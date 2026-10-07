import { startTransition } from "react"

import type { TModals } from "@/interfaces/TModals"

export type ProjectModalQuery = Exclude<TModals, "Appointment">

export function getUrlWithoutModal(href: string, modalQuery: ProjectModalQuery) {
  const url = new URL(href)
  const otherModals = url.searchParams.getAll("modal").filter(value => value !== modalQuery)
  url.searchParams.delete("modal")
  otherModals.forEach(value => url.searchParams.append("modal", value))
  return `${url.pathname}${url.search}${url.hash}`
}

export function openModalOnCurrentPage(modalQuery: ProjectModalQuery) {
  const url = new URL(window.location.href)
  if (url.searchParams.getAll("modal").length === 1 && url.searchParams.get("modal") === modalQuery) return

  url.searchParams.set("modal", modalQuery)
  // A null state lets Next update useSearchParams through its native history listener.
  startTransition(() => window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`))
}

export function closeModalOnCurrentPage(modalQuery: ProjectModalQuery) {
  if (!new URLSearchParams(window.location.search).getAll("modal").includes(modalQuery)) return

  startTransition(() => window.history.replaceState(null, "", getUrlWithoutModal(window.location.href, modalQuery)))
}
