import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  getGuestQrData,
  GuestNotFoundError,
  GuestForbiddenError,
  WeddingNotFoundError,
} from "@/modules/guests/guests.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string; guestId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId, guestId } = await params
    const data = await getGuestQrData(weddingId, guestId, userId)
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
    if (error instanceof GuestNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    console.error("[GET /api/v1/weddings/:weddingId/guests/:guestId/qr]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
