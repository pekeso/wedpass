import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import { createWeddingSchema } from "@/modules/weddings/weddings.schemas"
import { createWedding, listWeddings } from "@/modules/weddings/weddings.service"

export async function GET(request: NextRequest) {
  try {
    const { userId } = requireAuth(request)
    const data = await listWeddings(userId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    console.error("[GET /api/v1/weddings]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = requireAuth(request)
    const body = await request.json()
    const result = createWeddingSchema.safeParse(body)

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

    const data = await createWedding(userId, result.data)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    console.error("[POST /api/v1/weddings]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
