"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { Users, CheckSquare, Clock, Percent, Monitor } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/stores/auth-store"

interface WeddingStats {
  totalGuests: number
  checkedInGuests: number
  pendingGuests: number
  checkinPercentage: number
  totalMediaUploads: number
  lastSyncAt: string | null
}

interface DeviceCheckinStat {
  deviceId: string
  label: string
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: string | null
  checkinCount: number
}

interface CheckinStats {
  totalGuests: number
  checkedInGuests: number
  pendingGuests: number
  devices: DeviceCheckinStat[]
}

async function fetchWeddingStats(weddingId: string, accessToken: string): Promise<WeddingStats> {
  const res = await fetch(`/api/v1/weddings/${weddingId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

async function fetchCheckinStats(weddingId: string, accessToken: string): Promise<CheckinStats> {
  const res = await fetch(`/api/v1/weddings/${weddingId}/checkins/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function CheckinsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["wedding-stats", weddingId],
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated")
      return fetchWeddingStats(weddingId, accessToken)
    },
    enabled: !!accessToken,
    refetchInterval: 30_000,
  })

  const { data: checkinStats, isLoading: checkinLoading } = useQuery({
    queryKey: ["checkin-stats", weddingId],
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated")
      return fetchCheckinStats(weddingId, accessToken)
    },
    enabled: !!accessToken,
    refetchInterval: 30_000,
  })

  if (statsLoading || checkinLoading) {
    return <LoadingState message="Loading check-in stats..." />
  }
  if (statsError) {
    return (
      <ErrorState title="Failed to load stats" description="Please refresh and try again." />
    )
  }

  const checkinRate = stats?.checkinPercentage ?? 0
  const rateVariant =
    checkinRate >= 80 ? "success" : checkinRate >= 50 ? "info" : "default"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-In Stats"
        description="Live check-in progress and per-device sync summary. Auto-refreshes every 30 seconds."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Guests"
          value={stats?.totalGuests ?? 0}
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Checked In"
          value={stats?.checkedInGuests ?? 0}
          variant="success"
          icon={<CheckSquare className="size-4" />}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingGuests ?? 0}
          variant={stats?.pendingGuests ? "warning" : "default"}
          icon={<Clock className="size-4" />}
        />
        <StatCard
          title="Check-In Rate"
          value={`${checkinRate}%`}
          variant={rateVariant}
          icon={<Percent className="size-4" />}
          description={
            stats?.lastSyncAt ? `Last sync: ${formatDateTime(stats.lastSyncAt)}` : undefined
          }
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Per-Device Sync Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!checkinStats?.devices.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No staff devices registered yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Check-Ins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkinStats.devices.map((device) => (
                  <TableRow key={device.deviceId}>
                    <TableCell className="font-medium">{device.label}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={device.status === "ACTIVE" ? "Active" : "Revoked"}
                        variant={device.status === "ACTIVE" ? "success" : "neutral"}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {device.lastSeenAt ? formatDateTime(device.lastSeenAt) : "Never"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {device.checkinCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
