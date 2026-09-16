import { parseAdminUserIdArr } from "@/libs/adminAuth"

type AuthResult = {
  data: { user: { id: string } | null }
  error: unknown
}

export class AdminAnalyticsAccessError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "AdminAnalyticsAccessError"
  }
}

/** Keep the privileged read behind the same check for routes and server actions. */
export async function withAdminAnalyticsAccess<T>(
  getUser: () => Promise<AuthResult>,
  allowedUserIds: string | undefined,
  read: () => Promise<T>,
): Promise<T> {
  const { data, error } = await getUser()
  if (error || !data.user?.id || !parseAdminUserIdArr(allowedUserIds).includes(data.user.id)) {
    throw new AdminAnalyticsAccessError()
  }
  return read()
}
