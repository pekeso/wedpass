"use client"

import Link from "next/link"
import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { Camera, Clock, ShieldCheck, Users, CheckCircle2 } from "lucide-react"
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
      return <StatusBadge label="Event Mode active" variant="warning" />
    case "COMPLETED":
      return <StatusBadge label="Completed" variant="success" />
  }
}

function formatSubtitle(eventDate: string | null, location: string | null): string {
  const parts: string[] = []
  if (eventDate) {
    const date = new Date(eventDate)
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" })
    const formatted = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    parts.push(`${weekday} · ${formatted}`)
  }
  if (location) parts.push(location)
  return parts.join(" · ")
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

  const checkinPct = statsData?.checkinPercentage ?? 0
  const subtitle = formatSubtitle(wedding.eventDate ?? null, wedding.location ?? null)

  return (
    <div className="space-y-6">
      <PageHeader
        title={wedding.coupleNames ?? wedding.name}
        description={subtitle || undefined}
        badge={weddingStatusBadge(wedding.status)}
        primaryAction={
          <Link href={`/dashboard/wedding/${weddingId}/event-mode`}>
            <Button variant="navy">
              <ShieldCheck className="mr-2 size-4" />
              Prepare Event Mode
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="size-5" />}
          label="Total guests"
          value={statsData?.totalGuests ?? 0}
          tone="default"
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label="Checked in"
          value={statsData?.checkedInGuests ?? 0}
          sub={checkinPct > 0 ? `${checkinPct}% arrived` : undefined}
          accent={
            checkinPct > 0 ? (
              <StatusBadge label={`${checkinPct}%`} variant="success" />
            ) : undefined
          }
          tone="success"
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="Not yet arrived"
          value={statsData?.pendingGuests ?? 0}
          tone="warning"
        />
        <StatCard
          icon={<Camera className="size-5" />}
          label="Memories uploaded"
          value={statsData?.totalMediaUploads ?? 0}
          tone="gold"
        />
      </div>

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
