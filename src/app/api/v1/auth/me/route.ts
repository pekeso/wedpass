import { NextRequest, NextResponse } from "next/server"
import { requireAuth, UnauthorizedError } from "@/lib/auth/require-auth"
import { getCurrentUser, NotFoundError } from "@/modules/auth/auth.service"

export async function GET(request: NextRequest) {
  try {
    const { userId } = requireAuth(request)
    const data = await getCurrentUser(userId)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 404 }
      )
    }
    console.error("[auth/me]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
