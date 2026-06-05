import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getWeddingForUploadPage } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { MediaUploadForm } from "@/components/media/media-upload-form"
import { GuestUploadHeader } from "@/components/guest/guest-upload-header"

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

  try {
    const result = await getWeddingForUploadPage(slug)
    weddingId = result.weddingId
    weddingName = result.wedding.name
    coupleNames = result.wedding.coupleNames
  } catch (error) {
    if (error instanceof WeddingNotFoundError) {
      notFound()
    }
    throw error
  }

  const displayName = coupleNames ?? weddingName

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-lg">
        <GuestUploadHeader displayName={displayName} slug={slug} />
        <MediaUploadForm weddingId={weddingId} weddingSlug={slug} />
      </div>
    </div>
  )
}
