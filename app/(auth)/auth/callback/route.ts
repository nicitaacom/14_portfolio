import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// Named export for GET request handling
export async function GET(request: Request) {
  // 1. Parse the request URL and extract the authorization code
  const requestUrl = new URL(request.url)
  console.log(9, "requestUrl- ", requestUrl)
  const code = requestUrl.searchParams.get("code")

  // 2. Check if the code exists; if not, return an error response
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  try {
    // 3. Initialize Supabase client with route handler configuration
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )

    // 4. Exchange the authorization code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // 5. Handle any errors from the exchange process
    if (error) {
      console.error("Auth exchange error:", error.message)
      return NextResponse.json({ error: "Failed to authenticate", details: error.message }, { status: 401 })
    }

    // 6. Verify session data and user existence
    if (!data.session || !data.user || !data.user.email) {
      return NextResponse.json({ error: "Invalid session or user data" }, { status: 401 })
    }

    // 7. Successfully authenticated; redirect to origin
    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    // 8. Catch unexpected errors (e.g., network issues)
    console.error("Unexpected error in auth route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
