"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import type { PublicGalleryMediaItemDTO } from "@/modules/media/media.dto"

interface MediaCardProps {
  item: PublicGalleryMediaItemDTO
  onSelect: (item: PublicGalleryMediaItemDTO) => void
}

export function MediaCard({ item, onSelect }: MediaCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group relative aspect-square w-full overflow-hidden rounded-lg bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
      aria-label={item.mediaType === "VIDEO" ? "Play video" : "View photo"}
    >
      <Image
        src={item.thumbnailUrl ?? item.fileUrl}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
        unoptimized
      />

      {item.mediaType === "VIDEO" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md">
            <Play className="h-5 w-5 translate-x-0.5 text-navy" aria-hidden="true" />
          </div>
        </div>
      )}
    </button>
  )
}
