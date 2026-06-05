import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import LoginPageClient from "../[locale]/(auth)/login/LoginPageClient"
import { ADMIN_PASSWORD_COOKIE } from "@/libs/adminAuth"
import { TLocale } from "@/locales/config"
import { localizePath } from "@/locales/helpers"

export async function LoginPageView({ locale }: { locale: TLocale }) {
  const hasPasswordAccess = (await cookies()).get(ADMIN_PASSWORD_COOKIE)?.value === "true"

  if (!hasPasswordAccess) redirect(localizePath("/auth", locale))

  return <LoginPageClient />
}
