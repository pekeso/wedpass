import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  hideMediaItem,
  MediaWeddingNotFoundError,
  MediaForbiddenError,
  MediaNotFoundError,
} from "@/modules/media/media.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string; mediaId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId, mediaId } = await params
    const data = await hideMediaItem(weddingId, mediaId, userId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof MediaForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    if (error instanceof MediaNotFoundError || error instanceof MediaWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/media/:mediaId/hide]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
