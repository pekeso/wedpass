import { NextRequest, NextResponse } from "next/server"
import { requestUploadUrlSchema } from "@/modules/media/media.schemas"
import {
  requestUploadUrl,
  MediaWeddingNotFoundError,
  FileTooLargeError,
  UnsupportedFileTypeError,
} from "@/modules/media/media.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { weddingId } = await params
    const body = await request.json()

    const result = requestUploadUrlSchema.safeParse(body)
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

    const data = await requestUploadUrl(weddingId, result.data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof MediaWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Wedding not found" } },
        { status: 404 }
      )
    }
    if (error instanceof FileTooLargeError) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: error.message } },
        { status: 413 }
      )
    }
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNSUPPORTED_FILE_TYPE", message: error.message },
        },
        { status: 415 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/media/upload-url]", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" },
      },
      { status: 500 }
    )
  }
}
