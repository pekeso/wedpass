import { NextRequest, NextResponse } from "next/server"
import { getPublicWedding } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const data = await getPublicWedding(slug)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof WeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Wedding not found" } },
        { status: 404 }
      )
    }
    console.error("[GET /api/v1/public/weddings/:slug]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
