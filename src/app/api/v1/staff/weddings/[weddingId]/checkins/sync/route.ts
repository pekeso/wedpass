import { NextRequest, NextResponse } from "next/server"
import {
  requireStaffAuth,
  StaffUnauthorizedError,
  StaffForbiddenError,
} from "@/lib/auth/require-staff-auth"
import { syncPayloadSchema } from "@/modules/sync/sync.schemas"
import {
  processSyncBatch,
  SyncSnapshotMismatchError,
} from "@/modules/sync/sync.service"

export async function POST(
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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
        { status: 400 }
      )
    }

    const parsed = syncPayloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sync payload",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const result = await processSyncBatch(weddingId, staffDeviceId, parsed.data)

    return NextResponse.json({ success: true, data: result })
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
    if (error instanceof SyncSnapshotMismatchError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 409 }
      )
    }
    console.error("[POST /api/v1/staff/weddings/:weddingId/checkins/sync]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
