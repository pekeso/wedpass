import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import { getPublicWedding } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { GuestWeddingActions } from "@/components/guest/guest-wedding-actions"
import { GuestCoverOverlay } from "@/components/guest/guest-cover-overlay"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
import { LanguageToggle } from "@/components/shared/language-toggle"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { wedding } = await getPublicWedding(slug)
    const title = wedding.coupleNames
      ? `${wedding.coupleNames} — WedPass`
      : `${wedding.name} — WedPass`
    const description = wedding.location
      ? `Join us in celebrating ${wedding.coupleNames ?? wedding.name} in ${wedding.location}.`
      : `Join us in celebrating ${wedding.coupleNames ?? wedding.name}.`
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: wedding.coverImageUrl ? [{ url: wedding.coverImageUrl }] : [],
      },
    }
  } catch {
    return { title: "WedPass" }
  }
}

function formatCoverDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function isFutureDate(dateStr: string): boolean {
  return new Date(dateStr) > new Date()
}

export default async function GuestWeddingPage({ params }: Props) {
  const { slug } = await params

  let wedding: Awaited<ReturnType<typeof getPublicWedding>>["wedding"]
  try {
    const result = await getPublicWedding(slug)
    wedding = result.wedding
  } catch (error) {
    if (error instanceof WeddingNotFoundError) {
      notFound()
    }
    throw error
  }

  const isUpcoming = wedding.eventDate ? isFutureDate(wedding.eventDate) : false
  const displayName = wedding.coupleNames ?? wedding.name
  const formattedDate = wedding.eventDate ? formatCoverDate(wedding.eventDate) : null

  return (
    <div className="min-h-screen bg-ivory">
      {/* Cover section — full bleed, 420px tall */}
      <div className="relative h-[420px] w-full overflow-hidden">
        {wedding.coverImageUrl ? (
          <Image
            src={wedding.coverImageUrl}
            alt={`${displayName} cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-navy" />
        )}

        {/* Dark gradient — transparent at top, deep navy at bottom */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(transparent 40%, rgba(23,32,51,0.78))" }}
        />

        {/* Top bar — WedPass pill + language toggle */}
        <div className="absolute left-4 right-4 top-3.5 flex items-center justify-between">
          <div className="flex items-center gap-[7px] rounded-full bg-white/90 px-[11px] py-[6px]">
            <WedPassWordmark size={16} markOnly />
            <span className="text-[12px] font-bold text-navy">WedPass</span>
          </div>
          <LanguageToggle variant="cover" />
        </div>

        {/* Bottom text overlay — eyebrow + couple names + date/location */}
        <GuestCoverOverlay
          displayName={displayName}
          formattedDate={formattedDate}
          location={wedding.location ?? null}
        />
      </div>

      {/* Content */}
      <div className="px-[22px] pt-[26px]">
        <GuestWeddingActions
          slug={slug}
          galleryEnabled={wedding.galleryEnabled}
          isUpcoming={isUpcoming}
        />
      </div>
    </div>
  )
}
