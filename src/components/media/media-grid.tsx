"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { MediaCard } from "./media-card"
import type { PublicGalleryMediaItemDTO } from "@/modules/media/media.dto"

interface MediaGridProps {
  items: PublicGalleryMediaItemDTO[]
  isLoading: boolean
  onSelect: (item: PublicGalleryMediaItemDTO, index: number) => void
}

export function MediaGrid({ items, isLoading, onSelect }: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-[7px] px-[18px] pb-[18px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-[11px]" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-[7px] px-[18px] pb-[18px]">
      {items.map((item, index) => (
        <MediaCard key={item.id} item={item} onSelect={(i) => onSelect(i, index)} />
      ))}
    </div>
  )
}
