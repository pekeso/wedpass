import { NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/modules/auth/auth.schemas"
import { loginOrganizer, InvalidCredentialsError } from "@/modules/auth/auth.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid request data" },
        },
        { status: 400 }
      )
    }

    const data = await loginOrganizer(result.data)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 401 }
      )
    }
    console.error("[auth/login]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
