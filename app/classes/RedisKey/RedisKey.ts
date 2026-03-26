export class RedisKey {
  getIsGMLiveKey() {
    return "isGMLive"
  }

  getProjectLinkDailyDedupKey(userCookieId: string, projectSlug: string, userLocalDate: string) {
    return `analytics:project-link:daily:${userCookieId}:${projectSlug}:${userLocalDate}`
  }
}

export const redisKey = new RedisKey()
