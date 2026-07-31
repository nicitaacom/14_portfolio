"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { FiGithub } from "react-icons/fi"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { AuthHeader } from "./AuthHeader"
import supabaseClient from "@/libs/supabaseClient"
import { useDebounce } from "@/hooks"
import { Button } from "@/components/Button"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"

function formatWaitTime(seconds: number, t: ReturnType<typeof useScopedI18n>) {
  if (seconds <= 60) return `${seconds} ${seconds === 1 ? t("second") : t("seconds")}`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) return `${minutes} ${minutes === 1 ? t("minute") : t("minutes")}`

  return `${minutes} ${minutes === 1 ? t("minute") : t("minutes")} ${remainingSeconds} ${remainingSeconds === 1 ? t("second") : t("seconds")}`
}

export function AuthPageClient() {
  const searchParams = useSearchParams()
  const locale = useCurrentLocale()
  const t = useScopedI18n("auth")

  const [password, setPassword] = useState("")
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "rate-limited">(
    "idle",
  )
  const [rateLimitMessage, setRateLimitMessage] = useState("")
  const latestPasswordRef = useRef(password)
  const hasAutoStartedSignInRef = useRef(false)

  const debouncedPassword = useDebounce(password, 5000)

  const errorMessage = useMemo(() => {
    if (!searchParams) return ""

    const error = searchParams.get("error")
    const reason = searchParams.get("reason")
    const userId = searchParams.get("userId")
    const allowedIdsCount = searchParams.get("allowedIdsCount")

    if (error === "unauthorized" && reason === "admin_user_id_mismatch") {
      return t("unauthorizedMismatch", {
        userId: userId ?? "",
        allowedIdsCount: allowedIdsCount ?? "",
      })
    }

    if (error === "unauthorized") return t("unauthorized")
    if (error === "oauth") return t("oauthFailed")
    return ""
  }, [searchParams, t])

  useEffect(() => {
    latestPasswordRef.current = password

    if (!password) {
      hasAutoStartedSignInRef.current = false
      setIsPasswordVerified(false)
      setPasswordStatus("idle")
      setRateLimitMessage("")
    }
  }, [password])

  const signInWithGithub = useCallback(async () => {
    if (!isPasswordVerified || isSigningIn) return

    setIsSigningIn(true)

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}${localizePath("/auth/callback", locale)}` },
    })

    if (error) {
      setIsSigningIn(false)
      console.error("Auth error:", error)
    }
  }, [isPasswordVerified, isSigningIn, locale])

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
        const responseData = (await response.json().catch(() => null)) as
          | API.AdminPasswordResponse
          | { error?: string }
          | null

        if (latestPasswordRef.current !== debouncedPassword) return

        if (!response.ok) {
          setIsPasswordVerified(false)

          if (response.status === 429) {
            const retryAfter = Number(response.headers.get("retry-after") ?? "0")
            setRateLimitMessage(
              retryAfter > 0
                ? t("tooManyAttemptsWait", { duration: formatWaitTime(retryAfter, t) })
                : responseData && "error" in responseData && responseData.error
                  ? responseData.error
                  : t("tooManyAttempts"),
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
        if (latestPasswordRef.current !== debouncedPassword) return

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
  }, [debouncedPassword, t])

  useEffect(() => {
    if (!isPasswordVerified || isCheckingPassword || hasAutoStartedSignInRef.current) return

    hasAutoStartedSignInRef.current = true
    signInWithGithub()
  }, [isCheckingPassword, isPasswordVerified, signInWithGithub])

  function changePassword(nextPassword: string) {
    hasAutoStartedSignInRef.current = false
    setPassword(nextPassword)
    setIsPasswordVerified(false)
    setRateLimitMessage("")
    setPasswordStatus("idle")
  }

  const passwordStatusText = useMemo(() => {
    if (isSigningIn) return t("redirectingToGithub")
    if (!password) return t("enterPassword")
    if (passwordStatus === "checking") return t("checkingPassword")
    if (passwordStatus === "valid") return t("passwordAccepted")
    if (passwordStatus === "rate-limited") return rateLimitMessage || t("tooManyAttempts")
    if (passwordStatus === "invalid") return t("passwordInvalid")
    return t("waitingBeforeCheck")
  }, [isSigningIn, password, passwordStatus, rateLimitMessage, t])

  const passwordStatusClassName = useMemo(() => {
    if (passwordStatus === "valid") return "text-success"
    if (passwordStatus === "invalid" || passwordStatus === "rate-limited") return "text-danger"
    return "text-secondary-foreground"
  }, [passwordStatus])

  return (
    <div className="auth-page-shell min-h-[calc(100vh-72px)] flex items-center justify-center px-md">
      <div className="auth-panel machine-panel w-full max-w-[460px] p-lg flex flex-col gap-md">
        <AuthHeader errorMessage={errorMessage} />

        <div className="auth-key-field">
          <input
            type="password"
            value={password}
            onChange={event => changePassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="workshop-input w-full px-sm py-xs text-secondary outline-none transition-colors duration-300 placeholder:text-secondary-foreground focus:border-cta"
          />
          <div className="auth-status min-h-[20px] flex items-center gap-xs text-sm">
            {isCheckingPassword && <LoadingSpinner />}
            <p className={passwordStatusClassName}>{passwordStatusText}</p>
          </div>
        </div>

        <Button
          onClick={signInWithGithub}
          isDisabled={!isPasswordVerified || isCheckingPassword || isSigningIn}
          disabled={!isPasswordVerified || isCheckingPassword || isSigningIn}
          requestAction
          requestPending={isSigningIn}
          className="auth-submit w-full">
          <>
            {!isSigningIn && <FiGithub size={16} />}
            {isSigningIn ? t("redirecting") : t("signInWithGithub")}
          </>
        </Button>
      </div>
    </div>
  )
}
