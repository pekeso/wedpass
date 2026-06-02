import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { getPublicWedding } from "@/modules/weddings/weddings.service"
import { WeddingNotFoundError } from "@/modules/weddings/weddings.service"
import { GuestWeddingActions } from "@/components/guest/guest-wedding-actions"

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

function formatEventDate(dateStr: string): string {
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

  return (
    <div className="min-h-screen bg-ivory">
      {/* Cover image */}
      {wedding.coverImageUrl && (
        <div className="relative h-64 w-full sm:h-80">
          <Image
            src={wedding.coverImageUrl}
            alt={`${wedding.name} cover`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ivory/80" />
        </div>
      )}

      <div className="mx-auto max-w-lg px-6 py-10">
        {/* Wedding name & couple names */}
        <div className="mb-8 text-center">
          {wedding.coupleNames && (
            <h1 className="font-display text-4xl font-bold text-navy sm:text-5xl">
              {wedding.coupleNames}
            </h1>
          )}
          {!wedding.coupleNames && (
            <h1 className="font-display text-4xl font-bold text-navy sm:text-5xl">
              {wedding.name}
            </h1>
          )}
          {wedding.coupleNames && (
            <p className="mt-1 text-base font-medium text-champagne">{wedding.name}</p>
          )}
        </div>

        {/* Event details */}
        {(wedding.eventDate || wedding.location) && (
          <div className="mb-8 space-y-2 text-center text-sm text-navy/70">
            {wedding.eventDate && (
              <p className="font-medium">{formatEventDate(wedding.eventDate)}</p>
            )}
            {wedding.location && <p>{wedding.location}</p>}
          </div>
        )}

        <GuestWeddingActions
          slug={slug}
          galleryEnabled={wedding.galleryEnabled}
          isUpcoming={isUpcoming}
        />
      </div>
    </div>
  )
}
