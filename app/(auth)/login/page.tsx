"use client"

import { useEffect } from "react"
import useToast from "@/store/useToast"
import supabaseClient from "@/libs/supabaseClient"

export default function AuthPage() {
  const toast = useToast()

  useEffect(() => {
    async function authUser() {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${location.origin}/auth/callback/` },
      })
      if (error) {
        toast.show("error", "Error signing in", error.message)
        console.error("Auth error:", error)
      }
    }
    authUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div>Redirecting to GitHub login...</div>
}
