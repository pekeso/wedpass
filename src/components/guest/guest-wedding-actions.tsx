"use client"

import Link from "next/link"
import { Camera, ImageIcon } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

interface GuestWeddingActionsProps {
  slug: string
  galleryEnabled: boolean
  isUpcoming: boolean
}

export function GuestWeddingActions({
  slug,
  galleryEnabled,
  isUpcoming,
}: GuestWeddingActionsProps) {
  const { t } = useTranslations()

  return (
    <>
      {/* Contextual message */}
      <div className="mb-10 rounded-2xl border border-champagne/30 bg-champagne/10 px-6 py-5 text-center">
        <p className="text-sm leading-relaxed text-navy/80">
          {isUpcoming ? t("guest.upcomingMessage") : t("guest.pastMessage")}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/w/${slug}/upload`}
          className="flex items-center justify-center gap-2 rounded-xl bg-champagne px-6 py-4 text-base font-semibold text-white shadow-card transition-opacity hover:opacity-90 active:opacity-80"
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          {t("guest.sharePhotos")}
        </Link>

        {galleryEnabled && (
          <Link
            href={`/w/${slug}/gallery`}
            className="flex items-center justify-center gap-2 rounded-xl border border-navy/20 bg-white px-6 py-4 text-base font-semibold text-navy shadow-card transition-colors hover:bg-ivory-dark active:bg-ivory-dark"
          >
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
            {t("guest.viewGallery")}
          </Link>
        )}
      </div>

      {/* Privacy note */}
      <p className="mt-8 text-center text-xs text-navy/40">
        {t("guest.privacyNote")}
      </p>
    </>
  )
}
