import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getWeddingForUploadPage } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { MediaUploadForm } from "@/components/media/media-upload-form"
import { GuestUploadHeader, GuestUploadFooter } from "@/components/guest/guest-upload-header"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { wedding } = await getWeddingForUploadPage(slug)
    return {
      title: wedding.coupleNames
        ? `Share Photos — ${wedding.coupleNames} — WedPass`
        : `Share Photos — ${wedding.name} — WedPass`,
    }
  } catch {
    return { title: "Share Photos — WedPass" }
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
      <div className="mx-auto max-w-lg px-5 py-10">
        {/* Header */}
        <GuestUploadHeader displayName={displayName} />

        {/* Upload form */}
        <div className="rounded-2xl border border-champagne/20 bg-white px-5 py-6 shadow-card">
          <MediaUploadForm
            weddingId={weddingId}
            weddingSlug={slug}
          />
        </div>

        {/* Footer note */}
        <GuestUploadFooter />
      </div>
    </div>
  )
}
