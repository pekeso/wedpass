"use client"

import Link from "next/link"
import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { Camera, CalendarDays, MapPin, Settings, CheckSquare, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { useAuthStore } from "@/stores/auth-store"
import { getWedding } from "@/lib/api/weddings-client"
import { DashboardReadinessCard } from "@/components/wedding/dashboard-readiness-card"
import { DashboardStaffDevicesCard } from "@/components/wedding/dashboard-staff-devices-card"
import { DashboardSyncCard } from "@/components/wedding/dashboard-sync-card"
import { DashboardMediaThumbnails } from "@/components/wedding/dashboard-media-thumbnails"
import type { ApiResponse } from "@/types/api"
import type { WeddingStatus } from "@/generated/prisma/enums"

interface WeddingStats {
  totalGuests: number
  checkedInGuests: number
  pendingGuests: number
  checkinPercentage: number
  totalMediaUploads: number
  lastSyncAt: string | null
}

async function getWeddingStats(
  weddingId: string,
  accessToken: string
): Promise<ApiResponse<WeddingStats>> {
  const res = await fetch(`/api/v1/weddings/${weddingId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

function weddingStatusBadge(status: WeddingStatus) {
  switch (status) {
    case "DRAFT":
      return <StatusBadge label="Draft" variant="neutral" />
    case "ACTIVE":
      return <StatusBadge label="Active" variant="info" />
    case "EVENT_MODE":
      return <StatusBadge label="Event Mode" variant="warning" />
    case "COMPLETED":
      return <StatusBadge label="Completed" variant="success" />
  }
}


export default function WeddingOverviewPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await getWedding(weddingId, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  const { data: statsData } = useQuery({
    queryKey: ["wedding-stats", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await getWeddingStats(weddingId, accessToken)
      if (!res.success) return null
      return res.data
    },
    enabled: !!accessToken,
  })

  if (isLoading) return <LoadingState message="Loading wedding..." />
  if (isError)
    return <ErrorState title="Failed to load wedding" description="Please refresh and try again." />

  const wedding = data?.wedding

  if (!wedding) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title={wedding.name}
        description={wedding.coupleNames ?? undefined}
        primaryAction={
          <Link href={`/dashboard/wedding/${weddingId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 size-4" />
              Settings
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {weddingStatusBadge(wedding.status)}
        {wedding.eventDate && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {new Date(wedding.eventDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        {wedding.location && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {wedding.location}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Guests" value={statsData?.totalGuests ?? 0} icon={<Users className="size-4" />} />
        <StatCard title="Checked In" value={statsData?.checkedInGuests ?? 0} variant="success" icon={<CheckSquare className="size-4" />} />
        <StatCard
          title="Check-in Rate"
          value={`${statsData?.checkinPercentage ?? 0}%`}
          icon={<CheckSquare className="size-4" />}
        />
        <StatCard title="Media Uploads" value={statsData?.totalMediaUploads ?? 0} icon={<Camera className="size-4" />} />
      </div>
      {statsData?.lastSyncAt && (
        <p className="text-xs text-muted-foreground">
          Last sync:{" "}
          {new Date(statsData.lastSyncAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <DashboardReadinessCard weddingId={weddingId} accessToken={accessToken!} />
          <DashboardStaffDevicesCard weddingId={weddingId} accessToken={accessToken!} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DashboardSyncCard
            checkedInGuests={statsData?.checkedInGuests ?? 0}
            pendingGuests={statsData?.pendingGuests ?? 0}
            lastSyncAt={statsData?.lastSyncAt ?? null}
          />
          <DashboardMediaThumbnails weddingId={weddingId} accessToken={accessToken!} />
        </div>
      </div>
    </div>
  )
}
