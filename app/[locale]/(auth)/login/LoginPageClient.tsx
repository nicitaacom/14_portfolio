"use client"

import { useEffect } from "react"
import useToast from "@/store/useToast"
import supabaseClient from "@/libs/supabaseClient"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"

export default function LoginPageClient() {
  const toast = useToast()
  const locale = useCurrentLocale()
  const t = useScopedI18n("auth")
  const toastT = useScopedI18n("toast")

  useEffect(() => {
    async function authUser() {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${location.origin}${localizePath("/auth/callback", locale)}` },
      })

      if (error) {
        toast.show("error", toastT("defaultErrorTitle"), error.message)
        console.error("Auth error:", error)
      }
    }

    authUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div>{t("redirectingToGithub")}</div>
}
