"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { FiGithub } from "react-icons/fi"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { AuthHeader } from "./AuthHeader"
import supabaseClient from "@/libs/supabaseClient"
import { useDebounce } from "@/hooks"
import { Button } from "@/components/Button"

function formatWaitTime(seconds: number) {
  if (seconds <= 60) return `${seconds} second${seconds === 1 ? "" : "s"}`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) return `${minutes} minute${minutes === 1 ? "" : "s"}`

  return `${minutes} minute${minutes === 1 ? "" : "s"} ${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`
}

export function AuthPageClient() {
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "rate-limited">("idle")
  const [rateLimitMessage, setRateLimitMessage] = useState("")

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
      setRateLimitMessage("")
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
        const responseData = (await response.json().catch(() => null)) as API.AdminPasswordResponse | { error?: string } | null

        if (!response.ok) {
          setIsPasswordVerified(false)

          if (response.status === 429) {
            const retryAfter = Number(response.headers.get("retry-after") ?? "0")
            setRateLimitMessage(
              retryAfter > 0
                ? `Too many attempts. Please wait ${formatWaitTime(retryAfter)} before trying again.`
                : responseData && "error" in responseData && responseData.error
                  ? responseData.error
                  : "Too many attempts. Please wait before trying again.",
            )
            setPasswordStatus("rate-limited")
            return
          }

          setRateLimitMessage("")
          setPasswordStatus("invalid")
          return
        }

        setIsPasswordVerified(true)
        setRateLimitMessage("")
        setPasswordStatus("valid")
      } catch (error) {
        setIsPasswordVerified(false)

        if (error instanceof Error && error.message.toLowerCase().includes("too many")) {
          setRateLimitMessage(error.message)
          setPasswordStatus("rate-limited")
        } else {
          setRateLimitMessage("")
          setPasswordStatus("invalid")
        }

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
    if (passwordStatus === "rate-limited") return rateLimitMessage || "Too many attempts. Please wait before trying again."
    if (passwordStatus === "invalid") return "Password is not valid."
    return "Waiting 5 seconds before checking password."
  }, [password, passwordStatus, rateLimitMessage])

  const passwordStatusClassName = useMemo(() => {
    if (passwordStatus === "valid") return "text-success"
    if (passwordStatus === "invalid" || passwordStatus === "rate-limited") return "text-danger"
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
