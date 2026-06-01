import { NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/modules/auth/auth.schemas"
import { registerOrganizer, ConflictError } from "@/modules/auth/auth.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

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

    const data = await registerOrganizer(result.data)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 409 }
      )
    }
    console.error("[auth/register]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
