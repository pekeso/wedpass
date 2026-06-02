import { NextRequest, NextResponse } from "next/server"
import { getPublicGalleryMedia } from "@/modules/media/media.service"
import { MediaWeddingNotFoundError } from "@/modules/media/media.service"
import { publicGalleryQuerySchema } from "@/modules/media/media.schemas"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = request.nextUrl

    const parsed = publicGalleryQuerySchema.safeParse({
      mediaType: searchParams.get("mediaType") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid query parameters" },
        },
        { status: 400 }
      )
    }

    const result = await getPublicGalleryMedia(slug, parsed.data)

    if (!result.galleryEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          pagination: { page: parsed.data.page, pageSize: parsed.data.pageSize, total: 0 },
          galleryEnabled: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { ...result.data, galleryEnabled: true },
    })
  } catch (error) {
    if (error instanceof MediaWeddingNotFoundError) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Wedding not found" } },
        { status: 404 }
      )
    }
    console.error("[GET /api/v1/public/weddings/:slug/media]", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
