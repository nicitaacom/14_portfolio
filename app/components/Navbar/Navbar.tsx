import supabaseAdmin from "@/libs/supabaseAdmin"
import supabaseServer from "@/libs/supabaseServer"
import { NavbarWithProgress } from "./NavbarWithProgress"

export async function Navbar() {
  const { data: is_live_call } = await supabaseAdmin.from("liveCall").select().eq("id", 1).single()
  const {
    data: { user },
  } = await supabaseServer().auth.getUser()

  return <NavbarWithProgress userId={user?.id} is_live_call={!!is_live_call?.isGMLive} />
}
