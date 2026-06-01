import type { NextRequest } from "next/server"
import { verifyStaffToken } from "./staff-jwt"
import { prisma } from "@/lib/db/prisma"

export class StaffUnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED"
  constructor() {
    super("Unauthorized")
    this.name = "StaffUnauthorizedError"
  }
}

export class StaffForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("Staff device is not active or token is invalid")
    this.name = "StaffForbiddenError"
  }
}

export async function requireStaffAuth(
  request: NextRequest
): Promise<{ staffDeviceId: string; weddingId: string }> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    throw new StaffUnauthorizedError()
  }

  let payload: { staffDeviceId: string; weddingId: string }
  try {
    payload = verifyStaffToken(authHeader.slice(7))
  } catch {
    throw new StaffUnauthorizedError()
  }

  const device = await prisma.staffDevice.findFirst({
    where: { id: payload.staffDeviceId, weddingId: payload.weddingId },
    select: { status: true },
  })

  if (!device || device.status !== "ACTIVE") {
    throw new StaffForbiddenError()
  }

  return payload
}
