import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import {
  reissueStaffToken,
  StaffWeddingNotFoundError,
  StaffForbiddenError,
  StaffDeviceNotFoundError,
} from "@/modules/staff/staff.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string; deviceId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId, deviceId } = await params

    const data = await reissueStaffToken(weddingId, deviceId, userId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof StaffWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    if (error instanceof StaffForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    if (error instanceof StaffDeviceNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/staff/devices/:deviceId/reissue]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
