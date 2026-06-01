import { NextRequest, NextResponse } from "next/server"
import {
  requireStaffAuth,
  StaffUnauthorizedError,
  StaffForbiddenError,
} from "@/lib/auth/require-staff-auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { weddingId: paramWeddingId } = await params
    const { staffDeviceId, weddingId } = await requireStaffAuth(request)

    if (weddingId !== paramWeddingId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Token is not scoped to this wedding" } },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: { staffDeviceId, weddingId } })
  } catch (error) {
    if (error instanceof StaffUnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof StaffForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    console.error("[POST /api/v1/staff/weddings/:weddingId/verify]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
