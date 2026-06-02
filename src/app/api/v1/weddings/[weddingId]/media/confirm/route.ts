import { NextRequest, NextResponse } from "next/server"
import { confirmUploadSchema } from "@/modules/media/media.schemas"
import {
  confirmUpload,
  MediaWeddingNotFoundError,
  InvalidFileKeyError,
} from "@/modules/media/media.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { weddingId } = await params
    const body = await request.json()

    const result = confirmUploadSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const data = await confirmUpload(weddingId, result.data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof MediaWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Wedding not found" } },
        { status: 404 }
      )
    }
    if (error instanceof InvalidFileKeyError) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FILE_KEY", message: error.message } },
        { status: 400 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/media/confirm]", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" },
      },
      { status: 500 }
    )
  }
}
