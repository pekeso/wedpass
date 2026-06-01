"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Smartphone, Plus, Copy, Check, ShieldOff } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
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
} from "@/lib/api/staff-client"
import type { StaffDeviceListItemDTO } from "@/modules/staff/staff.dto"

export default function StaffPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
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

  async function handleCopyToken() {
    if (!createdToken) return
    await navigator.clipboard.writeText(createdToken)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  function formatLastSeen(value: string | null) {
    if (!value) return "Never"
    return new Date(value).toLocaleString()
  }

  if (isLoading) return <LoadingState message="Loading staff devices..." />
  if (isError) return <ErrorState title="Failed to load staff devices" description="Please refresh and try again." />

  const devices = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Devices"
        description="Manage staff access tokens for event-day check-in."
        primaryAction={
          <Button onClick={handleCreateOpen}>
            <Plus />
            Add Device
          </Button>
        }
      />

      {devices.length === 0 ? (
        <EmptyState
          title="No staff devices"
          description="Create a device to generate a staff access token."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Last Seen</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Created</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {device.label ?? <span className="text-muted-foreground">Unnamed</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={device.status}
                      variant={device.status === "ACTIVE" ? "success" : "danger"}
                    />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatLastSeen(device.lastSeenAt)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {new Date(device.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {device.status === "ACTIVE" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRevokeTarget(device)}
                      >
                        <ShieldOff />
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create device dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="device-label">Device label</Label>
              <Input
                id="device-label"
                placeholder="e.g. Entrance A Phone"
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
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token reveal dialog — shown once after creation */}
      <Dialog open={!!createdToken} onOpenChange={(open) => !open && setCreatedToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Access Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Copy or scan this token. It will not be shown again.
            </p>
            {createdToken && (
              <div className="flex justify-center py-2">
                <QRCodeCanvas value={createdToken} size={180} />
              </div>
            )}
            <div className="flex gap-2">
              <Input
                readOnly
                value={createdToken ?? ""}
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={handleCopyToken}>
                {tokenCopied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
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
