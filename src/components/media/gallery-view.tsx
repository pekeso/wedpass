"use client"

import { useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ImageIcon, VideoIcon, LayoutGrid, Camera } from "lucide-react"
import { MediaGrid } from "./media-grid"
import { MediaLightbox } from "./media-lightbox"
import type { PublicGalleryMediaItemDTO, PublicGalleryResponseDTO } from "@/modules/media/media.dto"

type MediaTypeFilter = "ALL" | "IMAGE" | "VIDEO"

interface GalleryApiResponse {
  success: boolean
  data: PublicGalleryResponseDTO & { galleryEnabled: boolean }
}

async function fetchGalleryPage(
  slug: string,
  mediaType: MediaTypeFilter,
  page: number
): Promise<GalleryApiResponse["data"]> {
  const params = new URLSearchParams({ page: String(page), pageSize: "30" })
  if (mediaType !== "ALL") params.set("mediaType", mediaType)
  const res = await fetch(`/api/v1/public/weddings/${slug}/media?${params}`)
  if (!res.ok) throw new Error("Failed to fetch gallery")
  const json: GalleryApiResponse = await res.json()
  if (!json.success) throw new Error("Failed to fetch gallery")
  return json.data
}

interface GalleryViewProps {
  slug: string
  galleryEnabled: boolean
  coupleNames: string | null
}

const FILTER_TABS: { label: string; value: MediaTypeFilter; icon: React.ReactNode }[] = [
  { label: "All", value: "ALL", icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" /> },
  { label: "Photos", value: "IMAGE", icon: <ImageIcon className="h-4 w-4" aria-hidden="true" /> },
  { label: "Videos", value: "VIDEO", icon: <VideoIcon className="h-4 w-4" aria-hidden="true" /> },
]

export function GalleryView({ slug, galleryEnabled, coupleNames }: GalleryViewProps) {
  const [filter, setFilter] = useState<MediaTypeFilter>("ALL")
  const [selectedItem, setSelectedItem] = useState<PublicGalleryMediaItemDTO | null>(null)

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["gallery", slug, filter],
    queryFn: ({ pageParam }) => fetchGalleryPage(slug, filter, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.items.length, 0)
      return loaded < lastPage.pagination.total ? allPages.length + 1 : undefined
    },
    enabled: galleryEnabled,
    staleTime: 60_000,
  })

  const allItems = data?.pages.flatMap((p) => p.items) ?? []
  const isEmpty = !isLoading && allItems.length === 0

  if (!galleryEnabled) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
          <ImageIcon className="h-7 w-7 text-navy/30" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-navy/70">Gallery not available</p>
        <p className="mt-1 text-sm text-navy/40">
          The gallery for this wedding is not currently enabled.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-5 flex gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={[
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-navy text-white"
                : "bg-navy/5 text-navy/70 hover:bg-navy/10",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid or empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-champagne/10">
            <Camera className="h-7 w-7 text-champagne" aria-hidden="true" />
          </div>
          <p className="text-base font-medium text-navy/70">No photos yet</p>
          <p className="mt-1 text-sm text-navy/40">
            {coupleNames
              ? `Be the first to share a moment from ${coupleNames}'s wedding.`
              : "Be the first to share a moment from the wedding."}
          </p>
        </div>
      ) : (
        <>
          <MediaGrid items={allItems} isLoading={isLoading} onSelect={setSelectedItem} />

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-xl border border-navy/20 bg-white px-6 py-3 text-sm font-medium text-navy shadow-card transition-colors hover:bg-ivory disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <MediaLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
