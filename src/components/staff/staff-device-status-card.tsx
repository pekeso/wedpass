import { Smartphone, WifiOff } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import type { StaffDeviceStatusDTO } from "@/modules/weddings/event-mode.service"

function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return "Never connected"
  const date = new Date(lastSeenAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

export function StaffDeviceStatusCard({ device }: { device: StaffDeviceStatusDTO }) {
  const isRevoked = device.status === "REVOKED"
  const hasConnected = !!device.lastSeenAt

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className={`rounded-full p-1.5 ${isRevoked ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
        {isRevoked ? <WifiOff className="size-4" /> : <Smartphone className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {device.label ?? "Unnamed Device"}
        </p>
        <p className="text-xs text-muted-foreground">
          Last seen: {formatLastSeen(device.lastSeenAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge
          label={isRevoked ? "Revoked" : "Active"}
          variant={isRevoked ? "danger" : "success"}
        />
        {!hasConnected && !isRevoked && (
          <StatusBadge label="Not downloaded" variant="warning" />
        )}
      </div>
    </div>
  )
}
