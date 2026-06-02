import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPublicWedding } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { GalleryView } from "@/components/media/gallery-view"
import { GalleryPageHeader } from "@/components/guest/gallery-page-header"

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
        <GalleryPageHeader displayName={displayName} slug={slug} />

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
