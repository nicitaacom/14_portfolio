import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_PASSWORD_COOKIE } from "@/libs/adminAuth"

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    cookies().delete(ADMIN_PASSWORD_COOKIE)
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 })
  }

  cookies().set(ADMIN_PASSWORD_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  })

  return NextResponse.json({ ok: true })
}
