"use client"

import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

interface GalleryPageHeaderProps {
  displayName: string
  slug: string
}

export function GalleryPageHeader({ displayName, slug }: GalleryPageHeaderProps) {
  const { t } = useTranslations()

  return (
    <div className="flex items-center justify-between px-[18px] pt-4 pb-0">
      <div className="flex items-center gap-[10px]">
        <Link
          href={`/w/${slug}`}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#e7e1d6] bg-white text-navy transition-colors hover:bg-ivory-dark"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
        </Link>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/40">
            {t("gallery.title")}
          </p>
          <p className="text-[19px] font-semibold leading-tight text-navy">{displayName}</p>
        </div>
      </div>

      <Link
        href={`/w/${slug}/upload`}
        className="flex items-center gap-[6px] rounded-[8px] bg-champagne px-[13px] py-[9px] text-[13px] font-semibold text-navy transition-colors hover:bg-champagne-light active:opacity-90"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {t("gallery.add")}
      </Link>
    </div>
  )
}
