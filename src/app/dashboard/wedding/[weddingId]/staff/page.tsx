"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Smartphone,
  Plus,
  Copy,
  Check,
  MoreHorizontal,
  RefreshCw,
  Shield,
} from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/auth-store"
import {
  listStaffDevices,
  createStaffDevice,
  revokeStaffDevice,
  reissueStaffToken,
} from "@/lib/api/staff-client"
import type { StaffDeviceListItemDTO } from "@/modules/staff/staff.dto"

type DeviceStatus = "ready" | "notready" | "revoked"

function getDeviceStatus(device: StaffDeviceListItemDTO): DeviceStatus {
  if (device.status === "REVOKED") return "revoked"
  if (device.lastSeenAt) return "ready"
  return "notready"
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const STATUS_META: Record<
  DeviceStatus,
  { label: string; badgeClass: string; dotClass: string; borderColor: string }
> = {
  ready: {
    label: "Offline pack ready",
    badgeClass: "bg-success-light text-success",
    dotClass: "bg-success",
    borderColor: "#16A34A",
  },
  notready: {
    label: "Not prepared",
    badgeClass: "bg-offline-light text-offline",
    dotClass: "bg-[#97a0b2]",
    borderColor: "#97a0b2",
  },
  revoked: {
    label: "Revoked",
    badgeClass: "bg-danger-light text-danger",
    dotClass: "bg-danger",
    borderColor: "#DC2626",
  },
}

function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const { label, badgeClass, dotClass } = STATUS_META[status]
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-semibold leading-none",
        badgeClass,
      ].join(" ")}
    >
      <span className={`size-[7px] shrink-0 rounded-full ${dotClass}`} />
      {label}
    </span>
  )
}

function StatChip({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="rounded-[9px] bg-ivory px-[11px] py-[9px]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#97a0b2]">
        {label}
      </div>
      <div
        className={[
          "mt-0.5 font-bold tabular-nums text-[15px]",
          highlight ? "text-warning" : "text-navy",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  )
}

function DeviceCard({
  device,
  onRevoke,
  onResend,
}: {
  device: StaffDeviceListItemDTO
  onRevoke: (device: StaffDeviceListItemDTO) => void
  onResend: (device: StaffDeviceListItemDTO) => void
}) {
  const status = getDeviceStatus(device)
  const { borderColor } = STATUS_META[status]

  return (
    <div
      className="rounded-2xl border border-[#efeae0] bg-white p-[22px] shadow-card"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-start justify-between">
        <div className="flex items-center gap-[11px]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-ivory-dark">
            <Smartphone className="size-5 text-navy" />
          </div>
          <div>
            <div className="text-[14.5px] font-bold leading-tight text-navy">
              {device.label ?? "Unnamed device"}
            </div>
            <div className="mt-1">
              <DeviceStatusBadge status={status} />
            </div>
          </div>
        </div>
        <button className="-m-1 p-1 text-[#97a0b2] hover:text-navy">
          <MoreHorizontal className="size-[18px]" />
        </button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2">
        <StatChip
          label="Snapshot"
          value={device.snapshotVersion != null ? `v${device.snapshotVersion}` : "—"}
        />
        <StatChip label="Guests" value={device.guestCount ?? "—"} />
        <StatChip
          label="Check-ins"
          value={device.checkinCount}
        />
      </div>

      {/* Footer */}
      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-[12px] text-[#6b7589]">
          Last seen: {formatRelativeTime(device.lastSeenAt)}
        </span>
        {status === "notready" && (
          <button
            onClick={() => onResend(device)}
            className="flex items-center gap-1.5 rounded-lg bg-ivory-dark px-3 py-[9px] text-[13px] font-semibold text-navy hover:bg-ivory"
          >
            <RefreshCw className="size-3.5" />
            Resend access
          </button>
        )}
        {status === "ready" && (
          <button
            onClick={() => onRevoke(device)}
            className="rounded-lg bg-danger-light px-3 py-[9px] text-[13px] font-semibold text-danger hover:bg-red-100"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}

export default function StaffPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [labelError, setLabelError] = useState("")
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<StaffDeviceListItemDTO | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-devices", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return listStaffDevices(weddingId, accessToken)
    },
    enabled: !!accessToken,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return createStaffDevice(weddingId, label.trim(), accessToken)
    },
    onSuccess: (res) => {
      setCreatedToken(res.staffToken)
      setCreateOpen(false)
      setLabel("")
      void queryClient.invalidateQueries({ queryKey: ["staff-devices", weddingId] })
    },
  })

  const revokeMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      if (!accessToken) throw new Error("Not authenticated")
      return revokeStaffDevice(weddingId, deviceId, accessToken)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-devices", weddingId] })
    },
  })

  const reissueMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      if (!accessToken) throw new Error("Not authenticated")
      return reissueStaffToken(weddingId, deviceId, accessToken)
    },
    onSuccess: (res) => {
      setCreatedToken(res.staffToken)
    },
  })

  function handleCreateOpen() {
    setLabel("")
    setLabelError("")
    setCreateOpen(true)
  }

  function handleCreateSubmit() {
    if (!label.trim()) {
      setLabelError("Label is required")
      return
    }
    setLabelError("")
    createMutation.mutate()
  }

  function getStaffLoginUrl(token: string) {
    return `https://wedpass.net/staff/${weddingId}/login?token=${token}`
  }

  async function handleCopyToken() {
    if (!createdToken) return
    await navigator.clipboard.writeText(getStaffLoginUrl(createdToken))
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  if (isLoading) return <LoadingState message="Loading staff devices..." />
  if (isError)
    return (
      <ErrorState
        title="Failed to load staff devices"
        description="Please refresh and try again."
      />
    )

  const devices = data?.items ?? []
  const activeDevices = devices.filter((d) => d.status === "ACTIVE")
  const readyCount = activeDevices.filter((d) => d.lastSeenAt).length
  const totalActive = activeDevices.length

  const subtitle =
    totalActive === 0
      ? "One staff access per device."
      : `One staff access per device. ${readyCount} of ${totalActive} ready.`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Devices"
        description={subtitle}
        primaryAction={
          <Button variant="navy" onClick={handleCreateOpen}>
            <Plus className="size-[17px]" />
            Generate Staff Access
          </Button>
        }
      />

      {/* Info banner */}
      <div className="flex max-w-[560px] gap-2.5 rounded-xl bg-sync-light p-3.5">
        <Smartphone className="mt-0.5 size-[18px] shrink-0 text-blue-700" />
        <p className="text-[13px] leading-snug text-blue-800">
          Create one staff access per device. Each device downloads its own offline pack.
        </p>
      </div>

      {devices.length === 0 ? (
        <EmptyState
          title="No staff devices"
          description="Generate a staff access token to get started."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onRevoke={setRevokeTarget}
                onResend={(d) => reissueMutation.mutate(d.id)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            className="bg-white"
            onClick={() =>
              router.push(`/dashboard/wedding/${weddingId}/sync-closeout`)
            }
          >
            <Shield className="size-4" />
            View Device Readiness &amp; Closeout
          </Button>
        </>
      )}

      {/* Generate staff access dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Staff Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="device-label">Device label</Label>
              <Input
                id="device-label"
                placeholder="e.g. Main Entrance · Phone 1"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
              />
              {labelError && (
                <p className="text-xs text-danger">{labelError}</p>
              )}
            </div>
            {createMutation.isError && (
              <p className="text-xs text-danger">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create device"}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Generating..." : "Generate Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token reveal dialog — shown once after creation */}
      <Dialog
        open={!!createdToken}
        onOpenChange={(open) => !open && setCreatedToken(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Access Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Scan the QR code or copy the link. It will not be shown again.
            </p>
            {createdToken && (
              <div className="flex justify-center py-2">
                <QRCodeCanvas value={getStaffLoginUrl(createdToken)} size={180} />
              </div>
            )}
            <div className="flex gap-2">
              <Input
                readOnly
                value={createdToken ? getStaffLoginUrl(createdToken) : ""}
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={handleCopyToken}>
                {tokenCopied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedToken(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm dialog */}
      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke Staff Device"
        description={`Revoke access for "${revokeTarget?.label ?? "this device"}"? The staff token will stop working immediately.`}
        confirmLabel="Revoke"
        variant="danger"
        onConfirm={() => {
          if (revokeTarget) {
            revokeMutation.mutate(revokeTarget.id)
            setRevokeTarget(null)
          }
        }}
      />
    </div>
  )
}
