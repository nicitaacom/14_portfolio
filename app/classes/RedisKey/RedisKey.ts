export class RedisKey {
  getIsGMLiveKey() {
    return "isGMLive"
  }

  getProjectLinkDailyDedupKey(userCookieId: string, projectSlug: string, userLocalDate: string) {
    return `analytics:project-link:daily:${userCookieId}:${projectSlug}:${userLocalDate}`
  }

  getDeviceIdByIpKey(ip: string) {
    return `utm:device-id:by-ip:${ip}`
  }

  getDeviceIdByFingerprintKey(fingerprint: string) {
    return `utm:device-id:by-fingerprint:${fingerprint}`
  }
}

export const redisKey = new RedisKey()
