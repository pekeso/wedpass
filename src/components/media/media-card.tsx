"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { PublicGalleryMediaItemDTO } from "@/modules/media/media.dto"

interface MediaCardProps {
  item: PublicGalleryMediaItemDTO
  onSelect: (item: PublicGalleryMediaItemDTO) => void
}

export function MediaCard({ item, onSelect }: MediaCardProps) {
  const { t } = useTranslations()

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group relative aspect-square w-full overflow-hidden rounded-[11px] bg-ivory-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
      aria-label={item.mediaType === "VIDEO" ? t("gallery.playVideo") : t("gallery.viewPhoto")}
    >
      <Image
        src={item.thumbnailUrl ?? item.fileUrl}
        alt=""
        fill
        sizes="33vw"
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
        unoptimized
      />

      {item.mediaType === "VIDEO" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(23,32,51,0.55)]">
            <Play className="h-4 w-4 translate-x-px fill-white text-white" aria-hidden="true" />
          </div>
        </div>
      )}
    </button>
  )
}
