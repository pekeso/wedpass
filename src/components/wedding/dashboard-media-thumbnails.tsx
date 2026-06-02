"use client"

import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Play } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { listOrganizerMedia } from "@/lib/api/media-client"
import type { OrganizerMediaItemDTO } from "@/modules/media/media.dto"

interface DashboardMediaThumbnailsProps {
  weddingId: string
  accessToken: string
}

export function DashboardMediaThumbnails({ weddingId, accessToken }: DashboardMediaThumbnailsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["media-thumbnails", weddingId],
    queryFn: async () => {
      const res = await listOrganizerMedia(weddingId, { pageSize: 4 }, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-champagne">
          Recent memories
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <MediaGrid items={data.items} total={data.pagination.total} />
        ) : (
          <EmptyMedia />
        )}
      </CardContent>
    </Card>
  )
}

function MediaGrid({ items, total }: { items: OrganizerMediaItemDTO[]; total: number }) {
  const awaitingReview = items.filter((item) => item.status === "UPLOADED").length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={item.fileUrl}
              alt="memory"
              fill
              unoptimized
              className="object-cover"
            />
            {item.mediaType === "VIDEO" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="size-6 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {total} uploads · {awaitingReview} awaiting review
      </p>
      <Link href="./gallery" className="text-sm font-medium text-navy hover:underline">
        Moderate →
      </Link>
    </div>
  )
}

function EmptyMedia() {
  return (
    <p className="text-sm text-muted-foreground">
      No uploads yet — share the guest upload link to get started.
    </p>
  )
}
