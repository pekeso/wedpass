"use client"

import Link from "next/link"
import { Camera } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

interface GalleryPageHeaderProps {
  displayName: string
  slug: string
}

export function GalleryPageHeader({ displayName, slug }: GalleryPageHeaderProps) {
  const { t } = useTranslations()

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{displayName}</h1>
        <p className="mt-1 text-sm text-navy/50">{t("gallery.title")}</p>
      </div>

      <div className="mb-8 flex justify-center">
        <Link
          href={`/w/${slug}/upload`}
          className="flex items-center gap-2 rounded-xl bg-champagne px-5 py-3 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 active:opacity-80"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {t("gallery.addPhotos")}
        </Link>
      </div>
    </>
  )
}
