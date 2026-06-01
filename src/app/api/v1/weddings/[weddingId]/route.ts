import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import { updateWeddingSchema } from "@/modules/weddings/weddings.schemas"
import {
  getWeddingForOrganizer,
  updateWedding,
  WeddingNotFoundError,
  WeddingForbiddenError,
  WeddingCompletedError,
} from "@/modules/weddings/weddings.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params
    const data = await getWeddingForOrganizer(weddingId, userId)
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
    if (error instanceof WeddingForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    console.error("[GET /api/v1/weddings/:weddingId]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params
    const body = await request.json()
    const result = updateWeddingSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const data = await updateWedding(weddingId, userId, result.data)
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
    if (error instanceof WeddingForbiddenError || error instanceof WeddingCompletedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 403 }
      )
    }
    console.error("[PATCH /api/v1/weddings/:weddingId]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
