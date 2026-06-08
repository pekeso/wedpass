import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  closeWedding,
  EventModeWeddingNotFoundError,
  EventModeForbiddenError,
  EventModeNotActiveError,
} from "@/modules/weddings/event-mode.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params

    const data = await closeWedding(weddingId, userId)
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
    if (error instanceof EventModeNotActiveError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 422 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/close]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
