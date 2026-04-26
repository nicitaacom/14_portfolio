"use client"

import { Suspense } from "react"
import { AuthPageClient } from "../[locale]/(auth)/auth/AuthPageClient"

export function AuthPageView() {
  return (
    <Suspense>
      <AuthPageClient />
    </Suspense>
  )
}
