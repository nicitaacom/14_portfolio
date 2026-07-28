"use client"

import { useSyncExternalStore } from "react"

import type { SiteTheme } from "@/interfaces/SiteTheme"

const DEFAULT_SITE_THEME: SiteTheme = "default"

function subscribeToThemeChange(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
    attributes: true,
  })

  return () => observer.disconnect()
}

function getThemeSnapshot(): SiteTheme {
  return (document.documentElement.dataset.theme as SiteTheme | undefined) ?? DEFAULT_SITE_THEME
}

function getServerThemeSnapshot(): SiteTheme {
  return DEFAULT_SITE_THEME
}

export function useSiteTheme() {
  return useSyncExternalStore(subscribeToThemeChange, getThemeSnapshot, getServerThemeSnapshot)
}
