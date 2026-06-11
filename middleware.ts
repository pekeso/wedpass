import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production for rate limiting"
      )
    }
    console.warn("[RateLimit] Redis not configured — rate limiting disabled (dev only)")
    return null
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  })
}

const limiters = {
  auth: createLimiter(5, "1 m"),
  uploadUrl: createLimiter(30, "1 m"),
  publicWedding: createLimiter(60, "1 m"),
  publicGallery: createLimiter(120, "1 m"),
  sync: createLimiter(20, "1 m"),
}

async function applyLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<boolean> {
  if (!limiter) return true
  const { success } = await limiter.limit(identifier)
  return success
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)

  if (
    pathname === "/api/v1/auth/login" ||
    pathname === "/api/v1/auth/register"
  ) {
    const allowed = await applyLimit(limiters.auth, `auth:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      )
    }
  }

  if (pathname.endsWith("/media/upload-url") || pathname.endsWith("/media/confirm")) {
    const allowed = await applyLimit(limiters.uploadUrl, `upload:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many upload requests. Please try again later." } },
        { status: 429 }
      )
    }
  }

  if (pathname.match(/^\/api\/v1\/public\/weddings\/[^/]+$/)) {
    const allowed = await applyLimit(limiters.publicWedding, `wedding:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      )
    }
  }

  if (pathname.match(/^\/api\/v1\/public\/weddings\/[^/]+\/media$/)) {
    const allowed = await applyLimit(limiters.publicGallery, `gallery:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      )
    }
  }

  if (pathname.endsWith("/checkins/sync")) {
    const allowed = await applyLimit(limiters.sync, `sync:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many sync requests. Please try again later." } },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/v1/auth/:path*",
    "/api/v1/weddings/:weddingId/media/upload-url",
    "/api/v1/weddings/:weddingId/media/confirm",
    "/api/v1/public/weddings/:slug",
    "/api/v1/public/weddings/:slug/media",
    "/api/v1/staff/weddings/:weddingId/checkins/sync",
  ],
}
