"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { listStaffDevices } from "@/lib/api/staff-client"
import type { StaffDeviceListItemDTO } from "@/modules/staff/staff.dto"

type SyncStatus = "synced" | "pending" | "lost"

function getSyncStatus(device: StaffDeviceListItemDTO): SyncStatus {
  if (device.pendingCheckinCount === null) return "lost"
  if (device.pendingCheckinCount === 0) return "synced"
  return "pending"
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const STATUS_META: Record<
  SyncStatus,
  {
    Icon: React.ElementType
    iconColor: string
    bgColor: string
    label: string
    badgeClass: string
    dotClass: string
  }
> = {
  synced: {
    Icon: CheckCircle2,
    iconColor: "#16A34A",
    bgColor: "#DCFCE7",
    label: "All synced",
    badgeClass: "bg-success-light text-success",
    dotClass: "bg-success",
  },
  pending: {
    Icon: Cloud,
    iconColor: "#D97706",
    bgColor: "#FEF3C7",
    label: "Pending sync",
    badgeClass: "bg-warning-light text-warning",
    dotClass: "bg-warning",
  },
  lost: {
    Icon: AlertTriangle,
    iconColor: "#DC2626",
    bgColor: "#FEE2E2",
    label: "Not synced",
    badgeClass: "bg-danger-light text-danger",
    dotClass: "bg-danger",
  },
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-semibold leading-none",
        meta.badgeClass,
      ].join(" ")}
    >
      <span className={`size-[7px] shrink-0 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  )
}

function DeviceRow({
  device,
  isFirst,
}: {
  device: StaffDeviceListItemDTO
  isFirst: boolean
}) {
  const status = getSyncStatus(device)
  const meta = STATUS_META[status]
  const { Icon } = meta

  return (
    <div
      className={[
        "flex items-center gap-4 px-[18px] py-4",
        !isFirst ? "border-t border-[rgba(23,32,51,0.07)]" : "",
      ].join(" ")}
    >
      {/* Status icon */}
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-[11px]"
        style={{ background: meta.bgColor }}
      >
        <Icon size={21} color={meta.iconColor} />
      </div>

      {/* Name + last seen */}
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold leading-tight text-navy truncate">
          {device.label ?? "Unnamed device"}
        </div>
        <div className="mt-0.5 text-[12.5px] text-muted-foreground">
          Last seen: {formatRelativeTime(device.lastSeenAt)}
        </div>
      </div>

      {/* Check-in count */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-[12.5px] text-muted-foreground">
        <Users size={13} className="shrink-0" />
        <span>{device.checkinCount} check-in{device.checkinCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Badge */}
      <SyncStatusBadge status={status} />
    </div>
  )
}

export default function SyncCloseoutPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-devices", weddingId],
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated")
      return listStaffDevices(weddingId, accessToken)
    },
    enabled: !!accessToken,
    refetchInterval: 30_000,
  })

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["staff-devices", weddingId] })
  }

  if (isLoading) return <LoadingState message="Loading device sync status..." />
  if (isError)
    return (
      <ErrorState
        title="Failed to load devices"
        description="Please refresh and try again."
      />
    )

  const devices = (data?.items ?? []).filter((d) => d.status !== "REVOKED")
  const syncStatuses = devices.map(getSyncStatus)
  const needsAttentionCount = syncStatuses.filter((s) => s !== "synced").length
  const allSynced = needsAttentionCount === 0 && devices.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post-Event Sync Closeout"
        description="Make sure all check-ins are safe before closing"
        primaryAction={
          <Button
            variant="outline"
            className="bg-white"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-1.5 size-4" />
            Refresh
          </Button>
        }
      />

      <div style={{ maxWidth: 820 }} className="space-y-5">
        {/* Warning banner */}
        <div className="flex gap-3 rounded-2xl bg-danger-light p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-danger"
          />
          <p className="text-[13.5px] leading-relaxed text-red-800">
            Do not mark this wedding complete until all staff devices have
            synced or have been manually reviewed.
          </p>
        </div>

        {/* Device list */}
        {devices.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(23,32,51,0.08)] bg-white py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No active staff devices found.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[rgba(23,32,51,0.08)] bg-white shadow-card">
            {devices.map((device, i) => (
              <DeviceRow key={device.id} device={device} isFirst={i === 0} />
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex justify-end">
          <Button
            className="bg-navy text-white hover:bg-navy/90"
            disabled={!allSynced}
            onClick={() => router.push(`/dashboard/wedding/${weddingId}`)}
          >
            <ShieldCheck className="size-4" />
            Return to Dashboard
          </Button>
        </div>

        {/* Attention note */}
        {needsAttentionCount > 0 && (
          <p className="text-right text-xs text-muted-foreground">
            {needsAttentionCount}{" "}
            {needsAttentionCount === 1 ? "device" : "devices"} still{" "}
            {needsAttentionCount === 1 ? "needs" : "need"} attention
          </p>
        )}
      </div>
    </div>
  )
}
