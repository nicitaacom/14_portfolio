"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { FiGithub } from "react-icons/fi"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { AuthHeader } from "./AuthHeader"
import supabaseClient from "@/libs/supabaseClient"
import { useDebounce } from "@/hooks"
import { Button } from "@/components/Button"

export function AuthPageClient() {
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle")

  const debouncedPassword = useDebounce(password, 5000)

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error")
    const reason = searchParams.get("reason")
    const userId = searchParams.get("userId")
    const allowedIdsCount = searchParams.get("allowedIdsCount")

    if (error === "unauthorized" && reason === "admin_user_id_mismatch") {
      return `GitHub signed in, but access was denied because Supabase user id "${userId}" was not found in ADMIN_USER_ID_ARR. Parsed admin ids: ${allowedIdsCount}.`
    }

    if (error === "unauthorized") return "GitHub signed in, but access was denied by the admin allowlist check."
    if (error === "oauth") return "GitHub sign-in failed."
    return ""
  }, [searchParams])

  useEffect(() => {
    if (!password) {
      setIsPasswordVerified(false)
      setPasswordStatus("idle")
    }
  }, [password])

  useEffect(() => {
    async function verifyPassword() {
      if (!debouncedPassword) return

      setIsCheckingPassword(true)
      setPasswordStatus("checking")

      try {
        const response = await fetch("/api/auth/admin-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: debouncedPassword }),
        })

        if (!response.ok) {
          setIsPasswordVerified(false)
          setPasswordStatus("invalid")
          return
        }

        setIsPasswordVerified(true)
        setPasswordStatus("valid")
      } catch (error) {
        setIsPasswordVerified(false)
        setPasswordStatus("invalid")
        console.error("Password verification error:", error)
      } finally {
        setIsCheckingPassword(false)
      }
    }

    verifyPassword()
  }, [debouncedPassword])

  async function signInWithGithub() {
    if (!isPasswordVerified) return

    setIsSigningIn(true)

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback/` },
    })

    if (error) {
      setIsSigningIn(false)
      console.error("Auth error:", error)
    }
  }

  const passwordStatusText = useMemo(() => {
    if (!password) return "Enter the password. It will auto-check after 5 seconds."
    if (passwordStatus === "checking") return "Checking password..."
    if (passwordStatus === "valid") return "Password accepted. GitHub login is unlocked."
    if (passwordStatus === "invalid") return "Password is not valid."
    return "Waiting 5 seconds before checking password."
  }, [password, passwordStatus])

  const passwordStatusClassName = useMemo(() => {
    if (passwordStatus === "valid") return "text-success"
    if (passwordStatus === "invalid") return "text-danger"
    return "text-secondary-foreground"
  }, [passwordStatus])

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-md">
      <div className="w-full max-w-[460px] rounded-lg border border-cta bg-primary-foreground p-lg flex flex-col gap-md">
        <AuthHeader errorMessage={errorMessage} />

        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="Admin password"
          className="w-full rounded-lg border border-secondary-foreground bg-transparent px-sm py-xs text-secondary outline-none transition-colors duration-300 placeholder:text-secondary-foreground focus:border-cta"
        />
        <div className="min-h-[20px] flex items-center gap-xs text-sm">
          {isCheckingPassword && <LoadingSpinner />}
          <p className={passwordStatusClassName}>{passwordStatusText}</p>
        </div>

        <Button
          onClick={signInWithGithub}
          isDisabled={!isPasswordVerified || isCheckingPassword || isSigningIn}
          disabled={!isPasswordVerified || isCheckingPassword || isSigningIn}
          className="w-full">
          <>
            {!isSigningIn && <FiGithub size={16} />}
            {isSigningIn ? "Redirecting..." : "Sign in with GitHub"}
          </>
        </Button>
      </div>
    </div>
  )
}
