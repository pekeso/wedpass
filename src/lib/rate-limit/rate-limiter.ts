import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function createRateLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  })
}

export const authLimiter = createRateLimiter(5, "1 m")
export const uploadUrlLimiter = createRateLimiter(30, "1 m")
export const publicGalleryLimiter = createRateLimiter(120, "1 m")
export const syncLimiter = createRateLimiter(20, "1 m")

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ limited: boolean }> {
  if (!limiter) return { limited: false }
  const { success } = await limiter.limit(identifier)
  return { limited: !success }
}
