import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  getActiveSnapshotForOrganizer,
  EventModeWeddingNotFoundError,
  EventModeForbiddenError,
} from "@/modules/weddings/event-mode.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params

    const snapshot = await getActiveSnapshotForOrganizer(weddingId, userId)
    if (!snapshot) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "No active snapshot found for this wedding" },
        },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: { snapshot } })
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
    console.error("[GET /api/v1/weddings/:weddingId/snapshot/active]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
