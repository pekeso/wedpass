import { NextRequest, NextResponse } from "next/server"
import {
  requireStaffAuth,
  StaffUnauthorizedError,
  StaffForbiddenError,
} from "@/lib/auth/require-staff-auth"
import {
  getSnapshotForStaffDownload,
  EventModeWeddingNotFoundError,
  EventModeSnapshotNotFoundError,
} from "@/modules/weddings/event-mode.service"
import { logEvent } from "@/lib/utils/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { weddingId: paramWeddingId } = await params
    const { staffDeviceId, weddingId } = await requireStaffAuth(request)

    if (weddingId !== paramWeddingId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Token is not scoped to this wedding" },
        },
        { status: 403 }
      )
    }

    const data = await getSnapshotForStaffDownload(weddingId, staffDeviceId)

    logEvent("snapshot_downloaded", {
      weddingId,
      staffDeviceId,
      guestCount: data.guests?.length ?? 0,
      snapshotId: data.snapshot?.id ?? null,
    })

    return NextResponse.json({ success: true, data })
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
    if (error instanceof EventModeWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    if (error instanceof EventModeSnapshotNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    console.error("[GET /api/v1/staff/weddings/:weddingId/snapshot]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
