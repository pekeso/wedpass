import type { NextRequest } from "next/server"
import { verifyToken } from "./jwt"

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED"
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

export function requireAuth(request: NextRequest): { userId: string } {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError()
  }
  try {
    return verifyToken(authHeader.slice(7))
  } catch {
    throw new UnauthorizedError()
  }
}
