import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getWeddingForUploadPage } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { MediaUploadForm } from "@/components/media/media-upload-form"
import { GuestUploadHeader } from "@/components/guest/guest-upload-header"
import { generateUploadToken } from "@/lib/auth/upload-token"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { wedding } = await getWeddingForUploadPage(slug)
    return {
      title: wedding.coupleNames
        ? `Share Memories — ${wedding.coupleNames} — WedPass`
        : `Share Memories — ${wedding.name} — WedPass`,
    }
  } catch {
    return { title: "Share Memories — WedPass" }
  }
}

export default async function GuestUploadPage({ params }: Props) {
  const { slug } = await params

  let weddingId: string
  let weddingName: string
  let coupleNames: string | null
  let weddingStatus: string

  try {
    const result = await getWeddingForUploadPage(slug)
    weddingId = result.weddingId
    weddingName = result.wedding.name
    coupleNames = result.wedding.coupleNames
    weddingStatus = result.weddingStatus
  } catch (error) {
    if (error instanceof WeddingNotFoundError) {
      notFound()
    }
    throw error
  }

  const displayName = coupleNames ?? weddingName
  const uploadsOpen = weddingStatus === "ACTIVE" || weddingStatus === "EVENT_MODE"

  if (!uploadsOpen) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="mx-auto max-w-lg">
          <GuestUploadHeader displayName={displayName} slug={slug} />
          <div className="px-5 pt-[18px]">
            <p className="text-[15px] text-navy/60">
              Uploads are not currently available for this wedding.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const uploadToken = generateUploadToken(weddingId)

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-lg">
        <GuestUploadHeader displayName={displayName} slug={slug} />
        <MediaUploadForm weddingId={weddingId} weddingSlug={slug} uploadToken={uploadToken} />
      </div>
    </div>
  )
}
