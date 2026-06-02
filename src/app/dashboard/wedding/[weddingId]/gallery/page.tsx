"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ImageIcon, Video, EyeOff, LayoutGrid } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { OrganizerMediaCard } from "@/components/media/organizer-media-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/stores/auth-store"
import {
  listOrganizerMedia,
  hideOrganizerMedia,
  showOrganizerMedia,
  deleteOrganizerMedia,
  getMediaDownloadUrl,
} from "@/lib/api/media-client"
import type { OrganizerMediaItemDTO } from "@/modules/media/media.dto"

type FilterTab = "all" | "photos" | "videos" | "hidden"

interface TabConfig {
  id: FilterTab
  label: string
  icon: React.ReactNode
}

const TABS: TabConfig[] = [
  { id: "all", label: "All", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: "photos", label: "Photos", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: "videos", label: "Videos", icon: <Video className="h-3.5 w-3.5" /> },
  { id: "hidden", label: "Hidden", icon: <EyeOff className="h-3.5 w-3.5" /> },
]

function tabToParams(tab: FilterTab) {
  switch (tab) {
    case "photos":
      return { mediaType: "IMAGE" as const }
    case "videos":
      return { mediaType: "VIDEO" as const }
    case "hidden":
      return { status: "HIDDEN" as const }
    default:
      return {}
  }
}

export default function GalleryPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const accessToken = useAuthStore((s) => s.accessToken) ?? ""
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const queryKey = ["organizer-media", weddingId, activeTab]

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await listOrganizerMedia(weddingId, tabToParams(activeTab), accessToken)
      if (!res.success) throw new Error(res.error?.message ?? "Failed to load media")
      return res.data
    },
    enabled: !!accessToken,
  })

  const hideMutation = useMutation({
    mutationFn: (mediaId: string) => hideOrganizerMedia(weddingId, mediaId, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizer-media", weddingId] }),
  })

  const showMutation = useMutation({
    mutationFn: (mediaId: string) => showOrganizerMedia(weddingId, mediaId, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizer-media", weddingId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => deleteOrganizerMedia(weddingId, mediaId, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizer-media", weddingId] }),
  })

  async function handleDownload(mediaId: string) {
    const res = await getMediaDownloadUrl(weddingId, mediaId, accessToken)
    if (!res.success) return
    window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer")
  }

  const items: OrganizerMediaItemDTO[] = data?.items ?? []
  const total = data?.pagination.total ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Gallery"
        description={total > 0 ? `${total} item${total !== 1 ? "s" : ""}` : undefined}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && <LoadingState message="Loading media..." />}

      {isError && (
        <ErrorState
          title="Could not load media"
          description="Please try again."
          actionLabel="Retry"
          onAction={() => queryClient.invalidateQueries({ queryKey })}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="No media found"
          description={
            activeTab === "hidden"
              ? "No hidden items."
              : "No photos or videos have been uploaded yet."
          }
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <OrganizerMediaCard
              key={item.id}
              item={item}
              onHide={async (id) => {
                await hideMutation.mutateAsync(id)
              }}
              onShow={async (id) => {
                await showMutation.mutateAsync(id)
              }}
              onDelete={async (id) => {
                await deleteMutation.mutateAsync(id)
              }}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  )
}
