import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import { findWeddingById } from "@/modules/weddings/weddings.repository"
import { countGuestsByWedding } from "@/modules/guests/guests.repository"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params

    const wedding = await findWeddingById(weddingId)
    if (!wedding) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Wedding not found" } },
        { status: 404 }
      )
    }
    if (wedding.organizerId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      )
    }

    const totalGuests = await countGuestsByWedding(weddingId)

    return NextResponse.json({
      success: true,
      data: {
        totalGuests,
        checkedInGuests: 0,
        pendingGuests: totalGuests,
        totalMediaUploads: 0,
      },
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    console.error("[GET /api/v1/weddings/:weddingId/stats]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
