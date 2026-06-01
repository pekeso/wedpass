import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  importGuests,
  GuestForbiddenError,
  EventModeLockedError,
  WeddingNotFoundError,
} from "@/modules/guests/guests.service"

const importBodySchema = z.object({
  guests: z.array(z.unknown()).min(1).max(1000),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params
    const body = await request.json()
    const bodyResult = importBodySchema.safeParse(body)

    if (!bodyResult.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request body" } },
        { status: 400 }
      )
    }

    const data = await importGuests(weddingId, userId, bodyResult.data.guests)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof WeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    if (error instanceof GuestForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    if (error instanceof EventModeLockedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 409 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/guests/import]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
