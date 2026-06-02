import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import { submitFeedbackSchema } from "@/modules/feedback/feedback.schemas"
import {
  submitFeedback,
  FeedbackWeddingNotFoundError,
  FeedbackForbiddenError,
} from "@/modules/feedback/feedback.service"
import { logEvent } from "@/lib/utils/logger"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const { userId } = requireAuth(request)
    const { weddingId } = await params
    const body = await request.json()

    const result = submitFeedbackSchema.safeParse(body)
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

    const data = await submitFeedback(weddingId, userId, result.data)

    logEvent("beta_feedback_submitted", { weddingId, rating: result.data.rating })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof FeedbackWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: error.message } },
        { status: 404 }
      )
    }
    if (error instanceof FeedbackForbiddenError) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: error.message } },
        { status: 403 }
      )
    }
    console.error("[POST /api/v1/weddings/:weddingId/feedback]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
