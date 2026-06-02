"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { MediaCard } from "./media-card"
import type { PublicGalleryMediaItemDTO } from "@/modules/media/media.dto"

interface MediaGridProps {
  items: PublicGalleryMediaItemDTO[]
  isLoading: boolean
  onSelect: (item: PublicGalleryMediaItemDTO) => void
}

export function MediaGrid({ items, isLoading, onSelect }: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  )
}
