import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LoginPageClient from "./LoginPageClient"
import { ADMIN_PASSWORD_COOKIE } from "@/libs/adminAuth"

export default function LoginPage() {
  const hasPasswordAccess = cookies().get(ADMIN_PASSWORD_COOKIE)?.value === "true"

  if (!hasPasswordAccess) redirect("/auth")

  return <LoginPageClient />
}
