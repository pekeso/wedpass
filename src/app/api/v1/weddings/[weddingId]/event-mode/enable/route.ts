import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  enableEventMode,
  EventModeWeddingNotFoundError,
  EventModeForbiddenError,
  EventModeAlreadyEnabledError,
  EventModeNotReadyError,
} from "@/modules/weddings/event-mode.service"

const enableEventModeSchema = z.object({
  confirmGuestListLock: z.literal(true),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params
    const body = await request.json()

    const result = enableEventModeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "You must confirm the guest list lock to enable Event Mode",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const data = await enableEventMode(weddingId, userId)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof EventModeWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    if (error instanceof EventModeForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    if (error instanceof EventModeAlreadyEnabledError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 409 }
      )
    }
    if (error instanceof EventModeNotReadyError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 422 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/event-mode/enable]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
