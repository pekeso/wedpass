import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Camera } from "lucide-react"
import { getPublicWedding } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { GalleryView } from "@/components/media/gallery-view"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { wedding } = await getPublicWedding(slug)
    const name = wedding.coupleNames ?? wedding.name
    return { title: `Gallery — ${name} — WedPass` }
  } catch {
    return { title: "Gallery — WedPass" }
  }
}

export default async function GuestGalleryPage({ params }: Props) {
  const { slug } = await params

  let wedding: Awaited<ReturnType<typeof getPublicWedding>>["wedding"]
  try {
    const result = await getPublicWedding(slug)
    wedding = result.wedding
  } catch (error) {
    if (error instanceof WeddingNotFoundError) notFound()
    throw error
  }

  const displayName = wedding.coupleNames ?? wedding.name

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{displayName}</h1>
          <p className="mt-1 text-sm text-navy/50">Wedding Gallery</p>
        </div>

        {/* Upload CTA */}
        <div className="mb-8 flex justify-center">
          <Link
            href={`/w/${slug}/upload`}
            className="flex items-center gap-2 rounded-xl bg-champagne px-5 py-3 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Add Your Photos
          </Link>
        </div>

        {/* Gallery */}
        <GalleryView
          slug={slug}
          galleryEnabled={wedding.galleryEnabled}
          coupleNames={wedding.coupleNames}
        />
      </div>
    </div>
  )
}
